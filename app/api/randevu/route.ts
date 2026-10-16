import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { takvimeEventEkle, takvimdenMeşgulSaatleriGetir } from '@/lib/googleCalendar'

// Randevu penceresi env ile ayarlanabilir — yeniden deploy etmeden değiştirilebilir.
const GUN_SAYISI = parseInt(process.env.RANDEVU_GUN_SAYISI || '14', 10)
const BASLANGIC_SAAT = process.env.RANDEVU_BASLANGIC_SAAT || '09:00'
const BITIS_SAAT = process.env.RANDEVU_BITIS_SAAT || '18:00'
const SLOT_DAKIKA = parseInt(process.env.RANDEVU_SLOT_DAKIKA || '30', 10)
const KAPALI_GUNLER = (process.env.RANDEVU_KAPALI_GUNLER || '0').split(',').map(Number) // 0=Pazar

function tarihStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function gunleriHesapla(): string[] {
  const gunler: string[] = []
  const bugun = new Date()
  for (let i = 1; gunler.length < GUN_SAYISI && i < GUN_SAYISI * 2 + 5; i++) {
    const d = new Date(bugun)
    d.setDate(bugun.getDate() + i)
    if (!KAPALI_GUNLER.includes(d.getDay())) gunler.push(tarihStr(d))
  }
  return gunler
}

function saatleriHesapla(): string[] {
  const [bh, bm] = BASLANGIC_SAAT.split(':').map(Number)
  const [eh, em] = BITIS_SAAT.split(':').map(Number)
  const saatler: string[] = []
  let dakika = bh * 60 + bm
  const bitisDakika = eh * 60 + em
  while (dakika + SLOT_DAKIKA <= bitisDakika) {
    const h = Math.floor(dakika / 60)
    const m = dakika % 60
    saatler.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    dakika += SLOT_DAKIKA
  }
  return saatler
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const internalKey = req.headers.get('x-internal-key')
  const admin = (session?.user as any)?.type === 'admin' || (!!internalKey && internalKey === process.env.INTERNAL_API_KEY)

  const gunler = gunleriHesapla()
  const saatler = saatleriHesapla()

  const kayitlar = await prisma.randevu.findMany({
    where: { tarih: { in: gunler } },
    orderBy: [{ tarih: 'asc' }, { saat: 'asc' }],
  })

  if (admin) {
    return NextResponse.json({ gunler, saatler, slotDakika: SLOT_DAKIKA, randevular: kayitlar })
  }
  return NextResponse.json({
    gunler,
    saatler,
    slotDakika: SLOT_DAKIKA,
    doluSlotlar: kayitlar.map(r => `${r.tarih}_${r.saat}`),
  })
}

export async function POST(req: NextRequest) {
  try {
    const { tarih, saat, adaySoyad, telefon, pozisyon, notlar } = await req.json()

    if (!tarih || !saat || !adaySoyad?.trim() || !telefon?.trim()) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })
    }
    const gunler = gunleriHesapla()
    const saatler = saatleriHesapla()
    if (!gunler.includes(tarih) || !saatler.includes(saat)) {
      return NextResponse.json({ error: 'Geçersiz tarih/saat' }, { status: 400 })
    }

    // Google Takvim'de gerçek bir çakışma var mı (örn. elle eklenmiş bir etkinlik) — varsa reddet.
    const meşgulSaatler = await takvimdenMeşgulSaatleriGetir(tarih)
    if (meşgulSaatler?.includes(saat)) {
      return NextResponse.json({ error: 'Bu saat takvimde dolu, lütfen başka bir saat seçin.' }, { status: 409 })
    }

    const randevu = await prisma.randevu.create({
      data: {
        tarih,
        saat,
        adaySoyad: adaySoyad.trim(),
        telefon: telefon.trim(),
        pozisyon: pozisyon?.trim() || 'Satış Yöneticisi',
        notlar: notlar?.trim() || null,
      },
    })

    const takvimSonuc = await takvimeEventEkle({
      tarih,
      saat,
      sureDakika: SLOT_DAKIKA,
      baslik: `${randevu.pozisyon} Görüşmesi — ${randevu.adaySoyad}`,
      aciklama: `Telefon: ${randevu.telefon}${notlar ? `\nNot: ${notlar}` : ''}`,
    })
    if (!takvimSonuc.ok) {
      console.error('Google Calendar\'a yazılamadı (randevu DB\'de kayıtlı, sadece takvim senkronu başarısız):', takvimSonuc.hata)
    }

    return NextResponse.json({ success: true, randevu, takvimeEklendi: takvimSonuc.ok })
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Bu saat az önce başka biri tarafından alındı, lütfen başka bir saat seçin.' }, { status: 409 })
    }
    console.error('Randevu oluşturma hatası:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
