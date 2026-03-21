import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const kartlar = await prisma.kanbanKart.findMany({ where: { musteriId: params.id }, orderBy: { sira: 'asc' } })
  return NextResponse.json(kartlar)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const body = await req.json()
  const kart = await prisma.kanbanKart.create({ data: { ...body, musteriId: params.id } })
  return NextResponse.json(kart)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { id, sutun } = await req.json()
  const kart = await prisma.kanbanKart.update({ where: { id }, data: { sutun } })
  return NextResponse.json(kart)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const kartId = searchParams.get('id')!
  await prisma.kanbanKart.delete({ where: { id: kartId } })
  return NextResponse.json({ success: true })
}
