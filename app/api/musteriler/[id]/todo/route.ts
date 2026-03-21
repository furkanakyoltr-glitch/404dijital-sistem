import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const todos = await prisma.todo.findMany({ where: { musteriId: params.id }, orderBy: { sira: 'asc' } })
  return NextResponse.json(todos)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const body = await req.json()
  const todo = await prisma.todo.create({
    data: { ...body, musteriId: params.id, sonTarih: body.sonTarih ? new Date(body.sonTarih) : null }
  })
  return NextResponse.json(todo)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { id } = await req.json()
  const todo = await prisma.todo.findUnique({ where: { id } })
  if (!todo) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  const updated = await prisma.todo.update({ where: { id }, data: { tamamlandi: !todo.tamamlandi } })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  await prisma.todo.delete({ where: { id: searchParams.get('id')! } })
  return NextResponse.json({ success: true })
}
