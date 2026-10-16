import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const ayar = await prisma.randevuAyar.findUnique({ where: { id: 'singleton' } })
  return NextResponse.json({
    gunler: ayar ? JSON.parse(ayar.gunler) : [],
    baslangicSaat: ayar?.baslangicSaat || '09:00',
    bitisSaat: ayar?.bitisSaat || '18:00',
    slotDakika: ayar?.slotDakika || 30,
  })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const { gunler, baslangicSaat, bitisSaat, slotDakika } = await req.json()
    if (!Array.isArray(gunler)) return NextResponse.json({ error: 'gunler bir dizi olmalı' }, { status: 400 })

    const ayar = await prisma.randevuAyar.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        gunler: JSON.stringify(gunler),
        baslangicSaat: baslangicSaat || '09:00',
        bitisSaat: bitisSaat || '18:00',
        slotDakika: slotDakika || 30,
      },
      update: {
        gunler: JSON.stringify(gunler),
        baslangicSaat: baslangicSaat || '09:00',
        bitisSaat: bitisSaat || '18:00',
        slotDakika: slotDakika || 30,
      },
    })

    return NextResponse.json({
      success: true,
      gunler: JSON.parse(ayar.gunler),
      baslangicSaat: ayar.baslangicSaat,
      bitisSaat: ayar.bitisSaat,
      slotDakika: ayar.slotDakika,
    })
  } catch (err: any) {
    console.error('Randevu ayar kaydetme hatası:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
