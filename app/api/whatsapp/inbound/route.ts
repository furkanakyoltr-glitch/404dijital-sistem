import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendWATemplate, sendWAText } from '@/lib/whatsapp'
import { leadGeldiBildir } from '@/lib/leadBildirim'

const FURKAN_NO = '+905446844067'

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

          const oncekiSohbet = await prisma.wPSohbet.findUnique({ where: { telNo }, select: { okunmadi: true } })
          const yeniSohbetMi = !oncekiSohbet
          const bildirimGerekli = telNo !== FURKAN_NO && (yeniSohbetMi || oncekiSohbet.okunmadi === false)

          const sohbet = await prisma.wPSohbet.upsert({
            where: { telNo },
            create: { telNo, isim, sonMesaj: sonMesajOzet, sonMesajZamani: new Date(), okunmadi: true },
            update: { isim: isim || undefined, sonMesaj: sonMesajOzet, sonMesajZamani: new Date(), okunmadi: true },
          })

          await prisma.wPSohbetMesaj.create({
            data: { sohbetId: sohbet.id, yon: 'gelen', icerik, medyaTipi, medyaAdi, waMedyaId, waMesajId: msg.id },
          })

          if (bildirimGerekli) {
            const ozetMetni = sonMesajOzet.length > 120 ? sonMesajOzet.slice(0, 117) + '...' : sonMesajOzet
            sendWATemplate(FURKAN_NO, 'yeni_mesaj_bildirimi_46445', [isim || telNo, ozetMetni || '(medya)']).catch(() => {})
          }

          if (yeniSohbetMi && telNo !== FURKAN_NO) {
            sendWAText(
              telNo,
              "Merhaba! 404 Dijital'e ulaştığınız için teşekkürler 🙌 Size en hızlı şekilde dönebilmemiz için işletme adınızı ve hangi konuda yardım istediğinizi yazar mısınız? Ekibimiz kısa süre içinde sizi arayacak."
            ).catch(() => {})

            prisma.lead.create({
              data: {
                telefon: telNo,
                adSoyad: isim || undefined,
                mesaj: icerik || undefined,
                kaynak: 'WhatsApp',
              },
            }).then((lead) => {
              leadGeldiBildir(lead).catch(() => {})
            }).catch((e) => console.error('WhatsApp lead oluşturma hatası:', e))
          }
        }
      }
    }
  } catch (err) {
    console.error('WhatsApp inbound webhook hatası:', err)
  }

  return NextResponse.json({ received: true })
}
