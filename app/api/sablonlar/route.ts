import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const sablonlar = await prisma.wASablon.findMany({ orderBy: [{ kategori: 'asc' }, { baslik: 'asc' }] })
  return NextResponse.json({ sablonlar: sablonlar.map(s => ({ ...s, parametreler: JSON.parse(s.parametreler) })) })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const { baslik, kategori, metaTemplateName, parametreler, onizlemeMetni } = await req.json()
    if (!baslik?.trim() || !metaTemplateName?.trim()) {
      return NextResponse.json({ error: 'Başlık ve Meta şablon adı zorunlu' }, { status: 400 })
    }
    const sablon = await prisma.wASablon.create({
      data: {
        baslik: baslik.trim(),
        kategori: kategori?.trim() || 'Genel',
        metaTemplateName: metaTemplateName.trim(),
        parametreler: JSON.stringify(Array.isArray(parametreler) ? parametreler : []),
        onizlemeMetni: onizlemeMetni?.trim() || null,
      },
    })
    return NextResponse.json({ success: true, sablon: { ...sablon, parametreler: JSON.parse(sablon.parametreler) } })
  } catch (err: any) {
    console.error('Şablon oluşturma hatası:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
