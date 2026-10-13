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
          const icerik =
            msg.text?.body ??
            (msg.type ? `[${msg.type}] (metin dışı mesaj — WhatsApp uygulamasından görüntüleyin)` : '(boş mesaj)')

          const sohbet = await prisma.wPSohbet.upsert({
            where: { telNo },
            create: { telNo, isim, sonMesaj: icerik, sonMesajZamani: new Date(), okunmadi: true },
            update: { isim: isim || undefined, sonMesaj: icerik, sonMesajZamani: new Date(), okunmadi: true },
          })

          await prisma.wPSohbetMesaj.create({
            data: { sohbetId: sohbet.id, yon: 'gelen', icerik, waMesajId: msg.id },
          })
        }
      }
    }
  } catch (err) {
    console.error('WhatsApp inbound webhook hatası:', err)
  }

  return NextResponse.json({ received: true })
}
