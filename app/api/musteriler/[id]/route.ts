import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const musteri = await prisma.musteri.findUnique({
    where: { id: params.id },
    include: { teklifler: { orderBy: { createdAt: 'desc' }, take: 1 } }
  })
  if (!musteri) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  return NextResponse.json(musteri)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const body = await req.json()
  const musteri = await prisma.musteri.update({ where: { id: params.id }, data: body })
  return NextResponse.json(musteri)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const id = params.id
  // Cascade olmayan ilişkileri önce temizle
  await prisma.gelir.updateMany({ where: { musteriId: id }, data: { musteriId: null } })
  await prisma.gider.updateMany({ where: { musteriId: id }, data: { musteriId: null } })
  await prisma.proje.deleteMany({ where: { musteriId: id } })
  await prisma.musteri.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
