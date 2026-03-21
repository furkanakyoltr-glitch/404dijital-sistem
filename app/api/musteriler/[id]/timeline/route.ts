import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const items = await prisma.timeline.findMany({ where: { musteriId: params.id }, orderBy: { baslangic: 'asc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const body = await req.json()
  const item = await prisma.timeline.create({
    data: { ...body, musteriId: params.id, baslangic: new Date(body.baslangic), bitis: body.bitis ? new Date(body.bitis) : null }
  })
  return NextResponse.json(item)
}
