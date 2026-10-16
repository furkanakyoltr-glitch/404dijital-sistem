import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendWATemplateDetayli } from '@/lib/whatsapp'

function telNoFormat(telefon: string): string {
  const temiz = telefon.replace(/\s+/g, '')
  if (temiz.startsWith('+')) return temiz
  return `+${temiz.replace(/^0/, '90')}`
}

async function logVeGonder(telefon: string, isim: string | undefined, templateName: string, params: string[], onizlemeMetni?: string) {
  const sonuc = await sendWATemplateDetayli(telefon, templateName, params)
  if (!sonuc.ok) return { telefon, ok: false, hata: sonuc.hata }

  const telNo = telNoFormat(telefon)
  const icerik = onizlemeMetni || `[Şablon: ${templateName}] ${params.join(' | ')}`

  const sohbet = await prisma.wPSohbet.upsert({
    where: { telNo },
    create: { telNo, isim: isim || undefined, sonMesaj: icerik, sonMesajZamani: new Date(), okunmadi: false },
    update: { isim: isim || undefined, sonMesaj: icerik, sonMesajZamani: new Date() },
  })
  await prisma.wPSohbetMesaj.create({ data: { sohbetId: sohbet.id, yon: 'giden', icerik } })

  return { telefon, ok: true }
}

// hedef: 'tek' -> tek numaraya gönderim, parametreDegerleri sırayla şablonun parametreler listesine karşılık gelir
// hedef: 'tumu' -> Lead tablosundaki (telefonu olan) herkese; şablonun parametreler listesi Lead alan adlarıyla eşleşir (örn. "adSoyad")
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const { sablonId, hedef, telefon, isim, parametreDegerleri } = await req.json()
    if (!sablonId || !hedef) return NextResponse.json({ error: 'Eksik veri' }, { status: 400 })

    const sablon = await prisma.wASablon.findUnique({ where: { id: sablonId } })
    if (!sablon) return NextResponse.json({ error: 'Şablon bulunamadı' }, { status: 404 })
    const parametreAlanlari: string[] = JSON.parse(sablon.parametreler)

    if (hedef === 'tek') {
      if (!telefon?.trim()) return NextResponse.json({ error: 'Telefon zorunlu' }, { status: 400 })
      const params = Array.isArray(parametreDegerleri) ? parametreDegerleri : []
      const sonuc = await logVeGonder(telefon.trim(), isim?.trim(), sablon.metaTemplateName, params, sablon.onizlemeMetni || undefined)
      return NextResponse.json({ success: sonuc.ok, sonuc })
    }

    if (hedef === 'tumu') {
      const leadler = await prisma.lead.findMany({
        where: { telefon: { not: null } },
        select: { telefon: true, adSoyad: true, firmaAdi: true, email: true },
      })
      const sonuclar: { telefon: string; ok: boolean; hata?: string }[] = []
      for (const lead of leadler) {
        if (!lead.telefon) continue
        const params = parametreAlanlari.map(alan => ((lead as any)[alan] || '').toString())
        const sonuc = await logVeGonder(lead.telefon, lead.adSoyad || undefined, sablon.metaTemplateName, params, sablon.onizlemeMetni || undefined)
        sonuclar.push(sonuc)
      }
      const basariliSayisi = sonuclar.filter(s => s.ok).length
      return NextResponse.json({ success: true, toplam: sonuclar.length, basarili: basariliSayisi, basarisiz: sonuclar.length - basariliSayisi, sonuclar })
    }

    return NextResponse.json({ error: 'Geçersiz hedef' }, { status: 400 })
  } catch (err: any) {
    console.error('Toplu gönderim hatası:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
