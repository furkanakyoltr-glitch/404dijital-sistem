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

  const where: any = {}
  if (durum) where.durum = durum
  if (arama) where.OR = [
    { adSoyad: { contains: arama, mode: 'insensitive' } },
    { firmaAdi: { contains: arama, mode: 'insensitive' } },
    { email: { contains: arama, mode: 'insensitive' } },
    { telefon: { contains: arama, mode: 'insensitive' } },
  ]

  let data, total
  try {
    ;[data, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          notlar: { orderBy: { createdAt: 'desc' }, include: { olusturan: { select: { name: true } } } },
          musteri: { select: { id: true, kasaNo: true, firmaAdi: true } },
        },
      }),
      prisma.lead.count({ where }),
    ])
  } catch (err) {
    // Migration henüz uygulanmadıysa (notlar/musteri alanları yoksa) eski haliyle dön
    console.error('Lead notlar/musteri include hatası, temel sorguya düşülüyor:', err)
    ;[data, total] = await Promise.all([
      prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } }),
      prisma.lead.count({ where }),
    ])
  }

  return NextResponse.json({ data, total })
}
