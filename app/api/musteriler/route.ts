import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const page = parseInt(searchParams.get('page') || '1')
  const durum = searchParams.get('durum')
  const arama = searchParams.get('arama')
  
  const where: any = {}
  if (durum) where.durum = durum
  if (arama) where.OR = [
    { firmaAdi: { contains: arama, mode: 'insensitive' } },
    { kasaNo: { contains: arama, mode: 'insensitive' } },
    { email: { contains: arama, mode: 'insensitive' } },
  ]
  
  const [data, total] = await Promise.all([
    prisma.musteri.findMany({ where, take: limit, skip: (page-1)*limit, orderBy: { createdAt: 'desc' }, include: { teklifler: { take: 1, orderBy: { createdAt: 'desc' } } } }),
    prisma.musteri.count({ where }),
  ])
  
  return NextResponse.json({ data, total, page, limit })
}
