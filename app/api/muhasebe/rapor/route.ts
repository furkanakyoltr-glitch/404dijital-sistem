import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { dateFrom, dateTo, raporTipi } = await req.json()
  const startDate = new Date(dateFrom)
  const endDate = new Date(dateTo)
  endDate.setHours(23, 59, 59, 999)

  const [gelirler, giderler] = await Promise.all([
    prisma.gelir.findMany({
      where: { tarih: { gte: startDate, lte: endDate } },
      orderBy: { tarih: 'asc' },
      include: { musteri: { select: { firmaAdi: true } } },
    }),
    prisma.gider.findMany({
      where: { tarih: { gte: startDate, lte: endDate } },
      orderBy: { tarih: 'asc' },
    }),
  ])

  const toplamGelir = gelirler.reduce((s, g) => s + g.netTutar, 0)
  const toplamGider = giderler.reduce((s, g) => s + g.netTutar, 0)

  return NextResponse.json({
    dateFrom,
    dateTo,
    raporTipi,
    toplamGelir,
    toplamGider,
    netKar: toplamGelir - toplamGider,
    gelirSayisi: gelirler.length,
    giderSayisi: giderler.length,
    gelirler,
    giderler,
  })
}
