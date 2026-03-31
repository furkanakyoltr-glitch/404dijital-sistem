import { NextRequest, NextResponse } from 'next/server'

const MAKE_WEBHOOK = 'https://hook.eu1.make.com/9psm572qyzuk0gw0ay2nyc1ws3qd6cr7'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    await fetch(MAKE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {})
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Islem basarisiz' }, { status: 500 }) }
}
