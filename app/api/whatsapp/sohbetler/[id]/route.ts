import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const sohbet = await prisma.wPSohbet.findUnique({
    where: { id: params.id },
    include: { mesajlar: { orderBy: { createdAt: 'asc' } } },
  })
  if (!sohbet) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  if (sohbet.okunmadi) {
    await prisma.wPSohbet.update({ where: { id: params.id }, data: { okunmadi: false } })
  }

  return NextResponse.json(sohbet)
}
