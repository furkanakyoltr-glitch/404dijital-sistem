import { NextRequest, NextResponse } from 'next/server'

const WA_TOKEN = process.env.WA_TOKEN!
const WA_PHONE_ID = process.env.WA_PHONE_NUMBER_ID!
const VERIFY_TOKEN = '404dijital2026'

const LEAD_RESPONSES: Record<string, string> = {
  'Strateji & Müdür': `*404 Strateji — Kiralık Pazarlama Müdürü Modeli* 🎯

Türkiye'de işletmenizin büyüme sürecini devreden ilk ekosistem modeli.

*Nasıl Çalışır?*
Tam zamanlı bir Pazarlama Müdürü gibi çalışır; reklam yönetiminden büyüme stratejisine, ROI takibinden sektör kıyaslamasına kadar her şeyi devralır.

*Müdür Seviyeleri:*
• Junior (0-3 yıl): 20.000 – 35.000 ₺/ay
• Mid-Level (3-7 yıl): 40.000 – 65.000 ₺/ay
• Senior (7+ yıl): 70.000 – 120.000 ₺/ay
• AI + Müdür: Üstteki ücret + %20

*Ekosistem Avantajı:* ⚡
404 bünyesinden hizmet alan firmalar; prodüksiyon, yazılım ve AI hizmetlerini piyasa fiyatlarının altında, sektör kalitesinin üstünde alır.

Sizi daha iyi tanıyalım ve size özel müdür önerelim. Görüşmek ister misiniz? 📅`,

  'Yazılım & AI': `*404 Yazılım & 404 AI — Teknoloji Katmanı* 💻🤖

*404 Yazılım:*
CRM sistemleri, WhatsApp otomasyonları, e-ticaret altyapısı, landing page ve tam kapsamlı yazılım çözümleri.

• Aylık SaaS: 3.000 – 15.000 ₺/ay
• Proje bazlı kurulum da mevcut

*404 AI:*
Yapay zeka destekli içerik üretimi, AI influencer videoları ve öngörücü ROI motoru. Klasik prodüksiyon maliyetini %60-70 oranında düşürür.

*Ekosistem Avantajı:* ⚡
Ekosistem bünyesinden hizmet alan firmalar, yazılım ve AI altyapısını piyasa fiyatının çok altında kullanır.

Projenizi konuşalım mı? 📅`,

  'Prodüksiyon & İnfulence': `*404 Dijital & Infulence — Üretim ve Etki Ağı* 🎬✨

*404 Dijital (Prodüksiyon):*
Video prodüksiyon, fotoğraf çekimi, sosyal medya içeriği, Meta & Google Ads yönetimi, web tasarım. Türkiye'nin en rekabetçi fiyatlarıyla, sektör kalitesinin üstünde üretim.

*Infulence (Influencer Marketing):*
Türkiye'nin ilk KOBİ odaklı, AI destekli influencer marketing platformu. Markalar ve içerik üreticilerini buluşturur. Güvenli escrow ödeme sistemi ve KOBİ'lere özel taksit / kredi seçeneği sunar.

*Ekosistem Avantajı:* ⚡
Ekosistem bünyesinden hizmet aldığınızda prodüksiyon maliyetleriniz piyasa fiyatlarının altında kalır.

Kampanyanızı birlikte planlayalım mı? 📅`,
}

async function sendWA(to: string, body: string) {
  await fetch(`https://graph.facebook.com/v22.0/${WA_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  })
}

// Meta webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Meta webhook events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const entry = body?.entry?.[0]
    const change = entry?.changes?.[0]?.value
    const message = change?.messages?.[0]

    if (!message) return NextResponse.json({ received: true })

    const from = message.from

    // Template quick-reply button
    if (message.type === 'button') {
      const buttonText = message.button?.text
      const response = LEAD_RESPONSES[buttonText]
      if (response) await sendWA(from, response)
      return NextResponse.json({ received: true })
    }

    // Interactive button reply
    if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
      const buttonText = message.interactive.button_reply.title
      const response = LEAD_RESPONSES[buttonText]
      if (response) await sendWA(from, response)
      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('Meta webhook hatası:', e)
    return NextResponse.json({ received: true })
  }
}
