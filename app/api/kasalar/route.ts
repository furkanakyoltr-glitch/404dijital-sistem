import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  
  const user = session.user as any
  if (user.type === 'musteri') {
    const musteri = await prisma.musteri.findFirst({ where: { kasaNo: user.kasaNo } })
    if (!musteri) return NextResponse.json([])
    return NextResponse.json([{ kasaNo: musteri.kasaNo, durum: musteri.durum, firmaAdi: musteri.firmaAdi }])
  }
  
  // Admin: tüm kasaları getir
  const musteriler = await prisma.musteri.findMany({
    select: { kasaNo: true, durum: true, firmaAdi: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(musteriler)
}
