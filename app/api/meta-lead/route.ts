import { NextRequest, NextResponse } from 'next/server'
import { createLead } from '@/lib/leads'

const VERIFY_TOKEN = 'lead404strateji2026'

const WA_TOKEN = process.env.WA_TOKEN!
const WA_PHONE_ID = process.env.WA_PHONE_NUMBER_ID!
const FURKAN_WA = '905446944067'

async function sendWA(to: string, text: string) {
  await fetch(`https://graph.facebook.com/v22.0/${WA_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
  })
}

// GET: Meta webhook doğrulama
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  if (mode === 'subscribe' && token === VERIFY_TOKEN) return new NextResponse(challenge)
  return new NextResponse('Forbidden', { status: 403 })
}

// POST: Meta lead geldi
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ ok: false })

  const changes = body?.entry?.[0]?.changes ?? []
  for (const change of changes) {
    if (change.field !== 'leadgen') continue
    const { leadgen_id, form_id } = change.value ?? {}
    if (!leadgen_id) continue

    // Lead detaylarını Meta'dan çek
    const metaToken = process.env.META_PAGE_TOKEN || WA_TOKEN
    const leadRes = await fetch(
      `https://graph.facebook.com/v22.0/${leadgen_id}?fields=field_data,created_time,ad_name,form_id&access_token=${metaToken}`
    )
    const leadData = await leadRes.json()

    if (!leadData.field_data) {
      console.error('Meta lead field_data yok:', JSON.stringify(leadData))
      continue
    }

    // Form alanlarını parse et
    const fields: Record<string, string> = {}
    for (const f of leadData.field_data) {
      fields[f.name?.toLowerCase()] = f.values?.[0] ?? ''
    }

    const isim = fields['full_name'] || fields['isim'] || fields['ad_soyad'] || fields['first_name'] || ''
    const telefon = fields['phone_number'] || fields['telefon'] || fields['phone'] || ''
    const email = fields['email'] || fields['e-posta'] || ''
    const butceRaw = fields['butce'] || fields['bütçe'] || fields['budget'] || fields['aylik_butce'] || fields['aylık_bütçe'] || ''
    const sirket = fields['company_name'] || fields['sirket'] || fields['şirket'] || ''

    const mesajParcalari = [`Reklam: ${leadData.ad_name || 'Bilinmiyor'}`]
    if (butceRaw) mesajParcalari.push(`Bütçe: ${butceRaw}`)

    await createLead({
      adSoyad: isim,
      firmaAdi: sirket,
      telefon,
      email,
      mesaj: mesajParcalari.join(' | '),
      kaynak: 'Facebook Lead Ads',
    })

    // Furkan'a WA bildirimi
    const waMsg = `🎯 Yeni Facebook Lead!\n\n👤 ${isim || 'Bilinmiyor'}\n📱 ${telefon || '—'}\n🏢 ${sirket || '—'}`
    await sendWA(FURKAN_WA, waMsg).catch(e => console.error('WA bildirim hatası:', e.message))

    console.log(`Lead admin panele eklendi | ${isim} | form:${form_id || leadData.form_id}`)
  }

  return NextResponse.json({ ok: true })
}
