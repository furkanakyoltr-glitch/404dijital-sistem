import { NextRequest, NextResponse } from 'next/server'

const WA_TOKEN = process.env.WA_TOKEN!
const WA_PHONE_ID = process.env.WA_PHONE_NUMBER_ID!

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
404 bünyesinden hizmet alan firmalar; prodüksiyon, yazılım ve AI hizmetlerini piyasa fiyatlarının altında, sektör kalitesinin üstünde alır. Beş şirket tek çatı altında birbirini besler — koordinasyon derdi yok.

Sizi daha iyi tanıyalım ve size özel müdür önerelim. Görüşmek ister misiniz? 📅`,

  'Yazılım & AI': `*404 Yazılım & 404 AI — Teknoloji Katmanı* 💻🤖

*404 Yazılım:*
CRM sistemleri, WhatsApp otomasyonları, e-ticaret altyapısı, landing page ve tam kapsamlı yazılım çözümleri. Ekosistemimizdeki tüm şirketlerin kendi yazılımını da biz geliştirdiğimiz için çözümlerimiz gerçek hayatta test edilmiş ve kanıtlanmış.

• Aylık SaaS: 3.000 – 15.000 ₺/ay
• Proje bazlı kurulum da mevcut

*404 AI:*
Yapay zeka destekli içerik üretimi, AI influencer videoları ve öngörücü ROI motoru. Klasik prodüksiyon maliyetini %60-70 oranında düşürür.

*Ekosistem Avantajı:* ⚡
Ekosistem bünyesinden hizmet alan firmalar, yazılım ve AI altyapısını piyasa fiyatının çok altında kullanır. Altyapı zaten kurulu — siz sadece yararlanırsınız.

Projenizi konuşalım mı? 📅`,

  'Prodüksiyon & İnfulence': `*404 Dijital & Infulence — Üretim ve Etki Ağı* 🎬✨

*404 Dijital (Prodüksiyon):*
Video prodüksiyon, fotoğraf çekimi, sosyal medya içeriği, Meta & Google Ads yönetimi, web tasarım. Türkiye'nin en rekabetçi fiyatlarıyla, sektör kalitesinin üstünde üretim.

*Infulence (Influencer Marketing):*
Türkiye'nin ilk KOBİ odaklı, AI destekli influencer marketing platformu. Markalar ve içerik üreticilerini buluşturur. Güvenli escrow ödeme sistemi ve KOBİ'lere özel taksit / kredi seçeneği sunar.

*Ekosistem Avantajı:* ⚡
Ekosistem bünyesinden hizmet aldığınız için prodüksiyon maliyetleriniz piyasa fiyatlarının altında kalır. Strateji, prodüksiyon ve yazılım aynı çatı altında olduğundan koordinasyon derdi yaşamazsınız.

Kampanyanızı birlikte planlayalım mı? 📅`,
}

export async function POST(req: NextRequest) {
  try {
    const { to, buttonTitle } = await req.json()
    if (!to || !buttonTitle) {
      return NextResponse.json({ error: 'to ve buttonTitle gerekli' }, { status: 400 })
    }

    const message = LEAD_RESPONSES[buttonTitle]
    if (!message) {
      return NextResponse.json({ error: 'Bilinmeyen buton' }, { status: 400 })
    }

    const res = await fetch(`https://graph.facebook.com/v22.0/${WA_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('WA reply hatası:', data)
      return NextResponse.json({ error: 'WA gönderilemedi', detail: data }, { status: 500 })
    }
    return NextResponse.json({ success: true, messageId: data?.messages?.[0]?.id })
  } catch (e) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
