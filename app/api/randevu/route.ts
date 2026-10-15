import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Mülakat günleri ve saat aralığı — bu davet turu için sabit.
const GUNLER = ['2026-10-16', '2026-10-17', '2026-10-18']
const SAATLER = ['12:00', '12:45', '13:30', '14:15', '15:00', '15:45', '16:30', '17:15']

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const internalKey = req.headers.get('x-internal-key')
  const admin = (session?.user as any)?.type === 'admin' || (!!internalKey && internalKey === process.env.INTERNAL_API_KEY)

  const kayitlar = await prisma.randevu.findMany({ orderBy: [{ tarih: 'asc' }, { saat: 'asc' }] })

  if (admin) {
    return NextResponse.json({ gunler: GUNLER, saatler: SAATLER, randevular: kayitlar })
  }
  // Herkese açık görünüm: sadece hangi slotların dolu olduğu, kimin aldığı değil.
  return NextResponse.json({
    gunler: GUNLER,
    saatler: SAATLER,
    doluSlotlar: kayitlar.map(r => `${r.tarih}_${r.saat}`),
  })
}

export async function POST(req: NextRequest) {
  try {
    const { tarih, saat, adaySoyad, telefon, pozisyon } = await req.json()

    if (!tarih || !saat || !adaySoyad?.trim() || !telefon?.trim()) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })
    }
    if (!GUNLER.includes(tarih) || !SAATLER.includes(saat)) {
      return NextResponse.json({ error: 'Geçersiz tarih/saat' }, { status: 400 })
    }

    const randevu = await prisma.randevu.create({
      data: {
        tarih,
        saat,
        adaySoyad: adaySoyad.trim(),
        telefon: telefon.trim(),
        pozisyon: pozisyon?.trim() || 'Satış Yöneticisi',
      },
    })

    return NextResponse.json({ success: true, randevu })
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Bu saat az önce başka biri tarafından alındı, lütfen başka bir saat seçin.' }, { status: 409 })
    }
    console.error('Randevu oluşturma hatası:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
