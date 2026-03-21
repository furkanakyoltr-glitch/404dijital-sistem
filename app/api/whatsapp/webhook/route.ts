import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { parseWPMesaj } from '@/lib/whatsapp/parser'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret')
  if (secret !== process.env.WP_WEBHOOK_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { mesaj, telNo } = body
  if (!mesaj) return NextResponse.json({ error: 'Mesaj yok' }, { status: 400 })
  const parsed = parseWPMesaj(mesaj)
  if (!parsed) return NextResponse.json({ received: true, parsed: false })
  const wpMesaj = await prisma.wPMesaj.create({
    data: { mesaj, telNo: telNo || '', islemTipi: parsed.islemTipi, tutar: parsed.tutar, kategori: parsed.kategori, aciklama: parsed.aciklama, durum: 'bekliyor' }
  })
  return NextResponse.json({ received: true, parsed: true, id: wpMesaj.id })
}
