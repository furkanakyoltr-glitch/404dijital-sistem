import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { takvimeEventEkle, takvimdenMeşgulSaatleriGetir } from '@/lib/googleCalendar'

async function ayarGetir() {
  const ayar = await prisma.randevuAyar.findUnique({ where: { id: 'singleton' } })
  const gunler: string[] = ayar ? JSON.parse(ayar.gunler) : []
  const baslangicSaat = ayar?.baslangicSaat || '09:00'
  const bitisSaat = ayar?.bitisSaat || '18:00'
  const slotDakika = ayar?.slotDakika || 30

  const [bh, bm] = baslangicSaat.split(':').map(Number)
  const [eh, em] = bitisSaat.split(':').map(Number)
  const saatler: string[] = []
  let dakika = bh * 60 + bm
  const bitisDakika = eh * 60 + em
  while (dakika + slotDakika <= bitisDakika) {
    const h = Math.floor(dakika / 60)
    const m = dakika % 60
    saatler.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    dakika += slotDakika
  }

  return { gunler, saatler, slotDakika }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const internalKey = req.headers.get('x-internal-key')
  const admin = (session?.user as any)?.type === 'admin' || (!!internalKey && internalKey === process.env.INTERNAL_API_KEY)

  const { gunler, saatler, slotDakika } = await ayarGetir()

  const kayitlar = await prisma.randevu.findMany({
    where: { tarih: { in: gunler } },
    orderBy: [{ tarih: 'asc' }, { saat: 'asc' }],
  })

  if (admin) {
    return NextResponse.json({ gunler, saatler, slotDakika, randevular: kayitlar })
  }
  return NextResponse.json({
    gunler,
    saatler,
    slotDakika,
    doluSlotlar: kayitlar.map(r => `${r.tarih}_${r.saat}`),
  })
}

export async function POST(req: NextRequest) {
  try {
    const { tarih, saat, adaySoyad, telefon, pozisyon, notlar } = await req.json()

    if (!tarih || !saat || !adaySoyad?.trim() || !telefon?.trim()) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })
    }
    const { gunler, saatler, slotDakika } = await ayarGetir()
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
      sureDakika: slotDakika,
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
