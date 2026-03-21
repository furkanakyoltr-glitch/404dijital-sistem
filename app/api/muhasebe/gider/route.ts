import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const arama = searchParams.get('arama')
  const limit = parseInt(searchParams.get('limit') || '50')
  const page = parseInt(searchParams.get('page') || '1')
  const where: any = {}
  if (arama) where.OR = [
    { kategori: { contains: arama, mode: 'insensitive' } },
    { aciklama: { contains: arama, mode: 'insensitive' } },
    { fisNo: { contains: arama, mode: 'insensitive' } },
  ]
  const [data, total] = await Promise.all([
    prisma.gider.findMany({ where, take: limit, skip: (page-1)*limit, orderBy: { tarih: 'desc' } }),
    prisma.gider.count({ where }),
  ])
  return NextResponse.json({ data, total })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const body = await req.json()
  const { kategori, altKategori, tutar, kdvOrani, kdvDahil, netTutar, tarih, aciklama, fisNo, fisUrl, odemeYontemi, banka, odemeDurumu, kismiTutar, vadeTarihi, musteriId } = body
  const gider = await prisma.gider.create({
    data: {
      kategori, altKategori, tutar: parseFloat(tutar), kdvOrani: kdvOrani ? parseFloat(kdvOrani) : null,
      kdvDahil: Boolean(kdvDahil), netTutar: parseFloat(netTutar),
      tarih: new Date(tarih), aciklama, fisNo, fisUrl, odemeYontemi, banka, odemeDurumu,
      kismiTutar: kismiTutar ? parseFloat(kismiTutar) : null,
      vadeTarihi: vadeTarihi ? new Date(vadeTarihi) : null,
      musteriId: musteriId || null,
    }
  })
  return NextResponse.json(gider)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  await prisma.gider.delete({ where: { id: searchParams.get('id')! } })
  return NextResponse.json({ success: true })
}
