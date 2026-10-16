import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { metaSablonOlustur } from '@/lib/whatsapp'

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
    const { baslik, kategori, metaTemplateName, parametreler, onizlemeMetni, metaOlustur, govde, metaKategori, ornekDegerler } = await req.json()
    if (!baslik?.trim()) {
      return NextResponse.json({ error: 'Başlık zorunlu' }, { status: 400 })
    }

    const paramListesi = Array.isArray(parametreler) ? parametreler : []

    if (metaOlustur) {
      if (!govde?.trim()) return NextResponse.json({ error: 'Meta şablon gövdesi zorunlu' }, { status: 400 })
      const sonuc = await metaSablonOlustur({
        baslik: baslik.trim(),
        kategori: metaKategori === 'UTILITY' ? 'UTILITY' : 'MARKETING',
        govde: govde.trim(),
        ornekDegerler: Array.isArray(ornekDegerler) ? ornekDegerler : [],
      })
      if (!sonuc.ok) {
        return NextResponse.json({ error: sonuc.hata || 'Meta şablon oluşturulamadı' }, { status: 502 })
      }
      const sablon = await prisma.wASablon.create({
        data: {
          baslik: baslik.trim(),
          kategori: kategori?.trim() || 'Genel',
          metaTemplateName: sonuc.templateName!,
          parametreler: JSON.stringify(paramListesi),
          onizlemeMetni: onizlemeMetni?.trim() || null,
          govde: govde.trim(),
          metaDurum: sonuc.durum || 'PENDING',
          metaTemplateId: sonuc.templateId || null,
        },
      })
      return NextResponse.json({ success: true, sablon: { ...sablon, parametreler: JSON.parse(sablon.parametreler) } })
    }

    if (!metaTemplateName?.trim()) {
      return NextResponse.json({ error: 'Meta şablon adı zorunlu (ya da yeni şablon oluştur seçeneğini kullanın)' }, { status: 400 })
    }
    const sablon = await prisma.wASablon.create({
      data: {
        baslik: baslik.trim(),
        kategori: kategori?.trim() || 'Genel',
        metaTemplateName: metaTemplateName.trim(),
        parametreler: JSON.stringify(paramListesi),
        onizlemeMetni: onizlemeMetni?.trim() || null,
        metaDurum: 'mevcut',
      },
    })
    return NextResponse.json({ success: true, sablon: { ...sablon, parametreler: JSON.parse(sablon.parametreler) } })
  } catch (err: any) {
    console.error('Şablon oluşturma hatası:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
