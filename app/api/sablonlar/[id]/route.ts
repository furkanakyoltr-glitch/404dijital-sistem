import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const { baslik, kategori, metaTemplateName, parametreler, onizlemeMetni } = await req.json()
    const sablon = await prisma.wASablon.update({
      where: { id: params.id },
      data: {
        baslik: baslik?.trim(),
        kategori: kategori?.trim(),
        metaTemplateName: metaTemplateName?.trim(),
        parametreler: Array.isArray(parametreler) ? JSON.stringify(parametreler) : undefined,
        onizlemeMetni: onizlemeMetni !== undefined ? (onizlemeMetni?.trim() || null) : undefined,
      },
    })
    return NextResponse.json({ success: true, sablon: { ...sablon, parametreler: JSON.parse(sablon.parametreler) } })
  } catch (err: any) {
    console.error('Şablon güncelleme hatası:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    await prisma.wASablon.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Şablon silme hatası:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
