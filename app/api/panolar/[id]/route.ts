import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function adminMi() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.type !== 'admin') return null
  return user
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await adminMi()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const pano = await prisma.pano.findUnique({ where: { id: params.id } })
  if (!pano) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  if (user.departman !== 'yonetim' && pano.departman !== user.departman) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  await prisma.pano.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
