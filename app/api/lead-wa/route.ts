import { NextRequest, NextResponse } from 'next/server'

const WA_TOKEN = process.env.WA_TOKEN!
const WA_PHONE_ID = process.env.WA_PHONE_NUMBER_ID!
const TEMPLATE_NAME = 'lead_karsilama'

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('90') && digits.length === 12) return digits
  if (digits.startsWith('0') && digits.length === 11) return '9' + digits
  if (digits.length === 10) return '90' + digits
  return digits
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone } = await req.json()
    if (!phone) return NextResponse.json({ error: 'Telefon gerekli' }, { status: 400 })

    const to = formatPhone(phone)
    const displayName = name || 'Değerli Müşteri'

    const res = await fetch(`https://graph.facebook.com/v22.0/${WA_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: TEMPLATE_NAME,
          language: { code: 'tr' },
          components: [
            {
              type: 'body',
              parameters: [{ type: 'text', text: displayName }],
            },
          ],
        },
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('WA lead mesaj hatası:', data)
      return NextResponse.json({ error: 'WA gönderilemedi', detail: data }, { status: 500 })
    }
    return NextResponse.json({ success: true, messageId: data?.messages?.[0]?.id })
  } catch (e) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
