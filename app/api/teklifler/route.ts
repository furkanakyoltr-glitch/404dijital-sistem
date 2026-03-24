import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const durum = searchParams.get('durum')
  const arama = searchParams.get('arama')
  const limit = parseInt(searchParams.get('limit') || '100')
  const page = parseInt(searchParams.get('page') || '1')

  const where: any = {}
  if (durum) where.durum = durum
  if (arama) where.OR = [
    { teklifNo: { contains: arama, mode: 'insensitive' } },
    { paketAdi: { contains: arama, mode: 'insensitive' } },
    { musteri: { firmaAdi: { contains: arama, mode: 'insensitive' } } },
  ]

  const [data, total] = await Promise.all([
    prisma.teklif.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      include: { musteri: { select: { id: true, firmaAdi: true, email: true, kasaNo: true } } },
    }),
    prisma.teklif.count({ where }),
  ])

  return NextResponse.json({ data, total })
}
