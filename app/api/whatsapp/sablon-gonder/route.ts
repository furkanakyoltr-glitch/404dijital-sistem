import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendWATemplate } from '@/lib/whatsapp'

// Tek seferlik/toplu şablon mesajı gönderimi için iç sistem endpoint'i.
// Admin paneli oturumu yerine INTERNAL_API_KEY header'ı ile korunur
// (örn. işe alım daveti gibi panel dışından tetiklenen toplu gönderimler için).
export async function POST(req: NextRequest) {
  const key = req.headers.get('x-internal-key')
  if (!key || key !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  try {
    const { telefon, isim, templateName, params, onizlemeMetni } = await req.json()
    if (!telefon || !templateName || !Array.isArray(params)) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 })
    }

    const basarili = await sendWATemplate(telefon, templateName, params)
    if (!basarili) {
      return NextResponse.json({ error: 'Şablon gönderilemedi' }, { status: 502 })
    }

    const telNo = telefon.startsWith('+') ? telefon : `+${telefon.replace(/^0/, '90').replace(/\s+/g, '')}`
    const icerik = onizlemeMetni || `[Şablon: ${templateName}] ${params.join(' | ')}`

    const sohbet = await prisma.wPSohbet.upsert({
      where: { telNo },
      create: { telNo, isim: isim || undefined, sonMesaj: icerik, sonMesajZamani: new Date(), okunmadi: false },
      update: { isim: isim || undefined, sonMesaj: icerik, sonMesajZamani: new Date() },
    })

    const mesaj = await prisma.wPSohbetMesaj.create({
      data: { sohbetId: sohbet.id, yon: 'giden', icerik },
    })

    return NextResponse.json({ success: true, mesaj })
  } catch (err: any) {
    console.error('Şablon gönderim hatası:', err)
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 })
  }
}
