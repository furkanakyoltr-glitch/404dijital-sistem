import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const arama = searchParams.get('arama')
  const durum = searchParams.get('durum')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const where: any = {}
  if (durum) where.tahsilatDurumu = durum
  if (arama) where.OR = [
    { musteriAdi: { contains: arama, mode: 'insensitive' } },
    { aciklama: { contains: arama, mode: 'insensitive' } },
    { dekontNo: { contains: arama, mode: 'insensitive' } },
  ]
  const [data, total] = await Promise.all([
    prisma.gelir.findMany({ where, take: limit, skip: (page-1)*limit, orderBy: { tarih: 'desc' }, include: { musteri: { select: { firmaAdi: true } } } }),
    prisma.gelir.count({ where }),
  ])
  return NextResponse.json({ data, total })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const body = await req.json()
  const { musteriId, musteriAdi, gelirTuru, tutar, kdvOrani, kdvDahil, netTutar, tarih, aciklama, dekontNo, dekontUrl, odemeYontemi, banka, tahsilatDurumu, kismiTutar, vadeTarihi } = body
  const gelir = await prisma.gelir.create({
    data: {
      musteriId: musteriId || null, musteriAdi: musteriAdi || null,
      gelirTuru, tutar: parseFloat(tutar), kdvOrani: parseFloat(kdvOrani),
      kdvDahil: Boolean(kdvDahil), netTutar: parseFloat(netTutar),
      tarih: new Date(tarih), aciklama, dekontNo, dekontUrl,
      odemeYontemi, banka, tahsilatDurumu,
      kismiTutar: kismiTutar ? parseFloat(kismiTutar) : null,
      vadeTarihi: vadeTarihi ? new Date(vadeTarihi) : null,
    }
  })
  return NextResponse.json(gelir)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')!
  await prisma.gelir.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
