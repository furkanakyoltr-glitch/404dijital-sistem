import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const gonderi = await prisma.sosyalMedyaGonderi.findUnique({ where: { id: params.id } })
  if (!gonderi) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  if (gonderi.durum !== 'bekliyor') {
    return NextResponse.json({ error: 'Sadece bekleyen gönderiler silinebilir' }, { status: 400 })
  }

  await prisma.sosyalMedyaGonderi.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
