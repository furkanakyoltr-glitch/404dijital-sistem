import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Meta (Facebook/Instagram) Lead Ads webhook.
// Kurulum: Meta for Developers > uygulaman > Webhooks > Page > "leadgen" alanına abone ol.
// Callback URL: https://404dijital.com/api/webhooks/meta-leads
// Verify Token: META_WEBHOOK_VERIFY_TOKEN env değişkeniyle aynı olmalı.
// Ayrıca METLA_PAGE_ACCESS_TOKEN (leads_retrieval izinli sayfa erişim token'ı) gerekir.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Doğrulama başarısız' }, { status: 403 })
}

async function fetchLeadDetay(leadgenId: string) {
  const token = process.env.META_PAGE_ACCESS_TOKEN
  if (!token) {
    console.error('META_PAGE_ACCESS_TOKEN tanımlı değil')
    return null
  }
  const res = await fetch(`https://graph.facebook.com/v19.0/${leadgenId}?access_token=${token}`)
  if (!res.ok) {
    console.error('Meta lead detay çekme hatası:', await res.text())
    return null
  }
  return res.json()
}

function alanBul(fieldData: { name: string; values: string[] }[], ...adaylar: string[]) {
  for (const aday of adaylar) {
    const f = fieldData.find(f => f.name.toLowerCase().includes(aday))
    if (f?.values?.[0]) return f.values[0]
  }
  return undefined
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'leadgen') continue
        const { leadgen_id, form_id, page_id, ad_id } = change.value || {}
        if (!leadgen_id) continue

        const detay = await fetchLeadDetay(leadgen_id)
        if (!detay?.field_data) continue

        const fieldData = detay.field_data as { name: string; values: string[] }[]
        const adSoyad = alanBul(fieldData, 'full_name', 'ad', 'isim', 'name')
        const telefon = alanBul(fieldData, 'phone_number', 'telefon', 'phone')
        const email = alanBul(fieldData, 'email', 'e-posta', 'eposta')

        // Aynı leadgen_id ile tekrar gelirse (Meta bazen retry eder) mükerrer kayıt açma
        const mevcut = await prisma.lead.findFirst({
          where: { kaynak: { contains: leadgen_id } },
        })
        if (mevcut) continue

        await prisma.lead.create({
          data: {
            adSoyad: adSoyad || null,
            telefon: telefon || null,
            email: email || null,
            kaynak: `Meta Reklam (form:${form_id || '-'}, leadgen:${leadgen_id})`,
            durum: 'yeni_lead',
          },
        })
      }
    }
  } catch (err) {
    console.error('Meta leads webhook hatası:', err)
  }

  // Meta her zaman 200 bekler, aksi halde webhook'u devre dışı bırakabilir
  return NextResponse.json({ received: true })
}
