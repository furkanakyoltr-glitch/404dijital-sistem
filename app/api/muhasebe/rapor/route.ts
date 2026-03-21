import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { dateFrom, dateTo, raporTipi, format } = await req.json()
  const startDate = new Date(dateFrom)
  const endDate = new Date(dateTo)
  const [gelirler, giderler] = await Promise.all([
    prisma.gelir.findMany({ where: { tarih: { gte: startDate, lte: endDate } }, orderBy: { tarih: 'asc' } }),
    prisma.gider.findMany({ where: { tarih: { gte: startDate, lte: endDate } }, orderBy: { tarih: 'asc' } }),
  ])
  const toplamGelir = gelirler.reduce((s, g) => s + g.netTutar, 0)
  const toplamGider = giderler.reduce((s, g) => s + g.netTutar, 0)
  const rapor = { dateFrom, dateTo, raporTipi, toplamGelir, toplamGider, netKar: toplamGelir - toplamGider, gelirSayisi: gelirler.length, giderSayisi: giderler.length }
  // Return JSON for now (client would handle Excel/PDF generation)
  return NextResponse.json(rapor)
}
