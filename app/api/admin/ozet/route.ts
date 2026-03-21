import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const [toplamMusteri, aktifMusteri, bekleyenTeklif, buAyGelir] = await Promise.all([
    prisma.musteri.count(),
    prisma.musteri.count({ where: { durum: 'aktif' } }),
    prisma.teklif.count({ where: { durum: 'bekliyor' } }),
    prisma.gelir.aggregate({ where: { tarih: { gte: startOfMonth }, onayDurumu: 'onaylandi' }, _sum: { netTutar: true } }),
  ])
  
  return NextResponse.json({
    toplamMusteri, aktifMusteri, bekleyenTeklif,
    buAyGelir: buAyGelir._sum.netTutar || 0,
    ortalamaROI: 850,
    tamamlanmaOrani: 78,
  })
}
