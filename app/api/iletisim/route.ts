import { NextRequest, NextResponse } from 'next/server'

const MAKE_WEBHOOK = 'https://hook.eu1.make.com/9psm572qyzuk0gw0ay2nyc1ws3qd6cr7'
const WEB3FORMS_KEY = '3c20d34e-3dfe-4ba8-a445-2265ac77ddcb'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, isletmeAdi, telefon, isim, email, mesaj } = body
    const subject = type === 'analiz'
      ? `Ucretsiz Analiz Talebi - ${isletmeAdi}`
      : `Iletisim Formu - ${isim}`
    const message = type === 'analiz'
      ? `Isletme: ${isletmeAdi}\nTelefon: ${telefon}`
      : `Isim: ${isim}\nEposta: ${email}\nTelefon: ${telefon}\nMesaj: ${mesaj}`
    await Promise.all([
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject,
          from_name: '404 Dijital Form',
          message,
          email: email || 'form@404dijital.com',
        }),
      }).catch(() => {}),
      fetch(MAKE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, isim, isletmeAdi, telefon, email, mesaj }),
      }).catch(() => {}),
    ])
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Form gonderilemedi' }, { status: 500 }) }
}
