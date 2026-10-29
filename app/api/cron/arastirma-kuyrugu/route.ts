import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Potansiyel müşteri araştırma kuyruğu. Secret ile korunur (cron route'larla aynı desen).
// GET: arastirmaDurumu 'bekliyor' olan, firma adı bilinen leadleri döner (araştırma yapılacaklar).
// PATCH: bir lead'in arastirmaDurumu'nu günceller (araştırma tamamlanınca 'tamamlandi' yapılır).

function yetkiliMi(req: NextRequest): boolean {
  const secret = req.nextUrl.searchParams.get('secret')
  return secret === process.env.WP_WEBHOOK_SECRET
}

export async function GET(req: NextRequest) {
  if (!yetkiliMi(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const leadler = await prisma.lead.findMany({
    where: { arastirmaDurumu: 'bekliyor', firmaAdi: { not: null } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ ok: true, leadler })
}

export async function PATCH(req: NextRequest) {
  if (!yetkiliMi(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, arastirmaDurumu } = body
  if (!id || !arastirmaDurumu) return NextResponse.json({ error: 'id ve arastirmaDurumu zorunlu' }, { status: 400 })

  const lead = await prisma.lead.update({ where: { id }, data: { arastirmaDurumu } })
  return NextResponse.json({ ok: true, lead })
}
