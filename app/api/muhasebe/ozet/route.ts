import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const [gelirlerBu, gelirlerGecen, giderlerBu, giderlerGecen, bekleyenGelir, bekleyenGider] = await Promise.all([
    prisma.gelir.aggregate({ where: { tarih: { gte: startOfMonth, lte: endOfMonth }, onayDurumu: 'onaylandi' }, _sum: { netTutar: true } }),
    prisma.gelir.aggregate({ where: { tarih: { gte: prevStart, lte: prevEnd }, onayDurumu: 'onaylandi' }, _sum: { netTutar: true } }),
    prisma.gider.aggregate({ where: { tarih: { gte: startOfMonth, lte: endOfMonth }, onayDurumu: 'onaylandi' }, _sum: { netTutar: true } }),
    prisma.gider.aggregate({ where: { tarih: { gte: prevStart, lte: prevEnd }, onayDurumu: 'onaylandi' }, _sum: { netTutar: true } }),
    prisma.gelir.aggregate({ where: { tahsilatDurumu: { in: ['Beklemede', 'Kısmi Tahsilat'] } }, _sum: { netTutar: true } }),
    prisma.gider.aggregate({ where: { odemeDurumu: { in: ['Beklemede', 'Kısmi Ödeme'] } }, _sum: { netTutar: true } }),
  ])
  const toplamGelir = gelirlerBu._sum.netTutar || 0
  const toplamGecenGelir = gelirlerGecen._sum.netTutar || 0
  const toplamGider = giderlerBu._sum.netTutar || 0
  const toplamGecenGider = giderlerGecen._sum.netTutar || 0
  return NextResponse.json({
    toplamGelir, toplamGider,
    netKar: toplamGelir - toplamGider,
    gelirDegisim: toplamGecenGelir > 0 ? ((toplamGelir - toplamGecenGelir) / toplamGecenGelir * 100).toFixed(1) : 0,
    giderDegisim: toplamGecenGider > 0 ? ((toplamGider - toplamGecenGider) / toplamGecenGider * 100).toFixed(1) : 0,
    bekleyenTahsilat: bekleyenGelir._sum.netTutar || 0,
    odenmesiGereken: bekleyenGider._sum.netTutar || 0,
  })
}
