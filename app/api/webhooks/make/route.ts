import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const challenge = searchParams.get('challenge')
  if (challenge) return NextResponse.json({ challenge })
  return NextResponse.json({ status: 'ok' })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body
    if (type === 'teklif_onaylandi') {
      await prisma.teklif.updateMany({ where: { teklifNo: data.kasaNo }, data: { durum: 'onaylandi' } })
    }
    return NextResponse.json({ received: true })
  } catch { return NextResponse.json({ error: 'Parse error' }, { status: 400 }) }
}
