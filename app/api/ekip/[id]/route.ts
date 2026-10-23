import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function yonetimMi() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.type !== 'admin') return null
  if (user.departman !== 'yonetim') return null
  return user
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await yonetimMi()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, departman, role, password } = body

    const data: any = {}
    if (name?.trim()) data.name = name
    if (departman?.trim()) data.departman = departman
    if (role?.trim()) data.role = role
    if (password?.trim()) data.password = await bcrypt.hash(password, 10)

    const guncel = await prisma.admin.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, departman: true, role: true, createdAt: true },
    })
    return NextResponse.json({ data: guncel })
  } catch (e) {
    console.error('Ekip güncelleme hatası:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await yonetimMi()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  if (params.id === user.id) return NextResponse.json({ error: 'Kendini silemezsin' }, { status: 400 })

  try {
    await prisma.admin.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Ekip silme hatası:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
