import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function yonetimMi() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.type !== 'admin' || user.departman !== 'yonetim') return null
  return user
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await yonetimMi()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await req.json()
    const { ad, tetikleyici, departman, mesaj, aktif } = body
    const data: any = {}
    if (ad !== undefined) data.ad = ad
    if (tetikleyici !== undefined) data.tetikleyici = tetikleyici
    if (departman !== undefined) data.departman = departman
    if (mesaj !== undefined) data.mesaj = mesaj
    if (aktif !== undefined) data.aktif = aktif

    const guncel = await prisma.otomasyon.update({ where: { id: params.id }, data })
    return NextResponse.json({ data: guncel })
  } catch (e) {
    console.error('Otomasyon güncelleme hatası:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await yonetimMi()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  await prisma.otomasyon.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
