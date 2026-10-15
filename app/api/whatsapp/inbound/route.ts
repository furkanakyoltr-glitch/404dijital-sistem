import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// WhatsApp Cloud API — gelen müşteri mesajları webhook'u (insan tarafından yanıtlanacak gelen kutusu).
// Kurulum: Meta for Developers > uygulaman > WhatsApp > Configuration > Webhook
// Callback URL: https://404dijital.com/api/whatsapp/inbound
// Verify Token: WA_WEBHOOK_VERIFY_TOKEN env değişkeniyle aynı olmalı.
// "messages" alanına abone olunmalı.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WA_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Doğrulama başarısız' }, { status: 403 })
}

function normalizeTel(waId: string): string {
  return waId.startsWith('+') ? waId : `+${waId}`
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue
        const value = change.value || {}
        const contact = value.contacts?.[0]

        for (const msg of value.messages || []) {
          const telNo = normalizeTel(msg.from)
          const isim = contact?.profile?.name

          let icerik = msg.text?.body ?? ''
          let medyaTipi: string | null = null
          let medyaAdi: string | null = null
          let waMedyaId: string | null = null

          if (msg.type === 'image' || msg.type === 'document') {
            const medya = msg[msg.type]
            medyaTipi = msg.type
            medyaAdi = medya?.filename || (msg.type === 'image' ? 'Görsel' : 'Dosya')
            waMedyaId = medya?.id || null
            icerik = medya?.caption || ''
          } else if (!icerik) {
            icerik = msg.type ? `[${msg.type}] (bu mesaj türü panelde görüntülenemiyor)` : '(boş mesaj)'
          }

          const sonMesajOzet = medyaTipi === 'image' ? '📷 Görsel' : medyaTipi === 'document' ? `📎 ${medyaAdi}` : icerik

          const sohbet = await prisma.wPSohbet.upsert({
            where: { telNo },
            create: { telNo, isim, sonMesaj: sonMesajOzet, sonMesajZamani: new Date(), okunmadi: true },
            update: { isim: isim || undefined, sonMesaj: sonMesajOzet, sonMesajZamani: new Date(), okunmadi: true },
          })

          await prisma.wPSohbetMesaj.create({
            data: { sohbetId: sohbet.id, yon: 'gelen', icerik, medyaTipi, medyaAdi, waMedyaId, waMesajId: msg.id },
          })
        }
      }
    }
  } catch (err) {
    console.error('WhatsApp inbound webhook hatası:', err)
  }

  return NextResponse.json({ received: true })
}
