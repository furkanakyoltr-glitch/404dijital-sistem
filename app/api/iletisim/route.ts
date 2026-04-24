import { NextRequest, NextResponse } from 'next/server'

const MAKE_WEBHOOK = 'https://hook.eu1.make.com/9psm572qyzuk0gw0ay2nyc1ws3qd6cr7'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const baseUrl = process.env.NEXTAUTH_URL || 'https://404dijital.com'

    // Make bildirimi (ekip için)
    fetch(MAKE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {})

    // Lead'e otomatik karşılama mesajı
    if (body.telefon) {
      fetch(`${baseUrl}/api/lead-wa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: body.isim, phone: body.telefon }),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Islem basarisiz' }, { status: 500 }) }
}
