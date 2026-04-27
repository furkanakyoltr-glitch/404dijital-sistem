import { NextRequest, NextResponse } from 'next/server'

const VERIFY_TOKEN = 'lead404strateji2026'

const SUPABASE_URL = 'https://qiffhdcoxzdxrcywciwq.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpZmZoZGNveHpkeHJjeXdjaXdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIzODI3OCwiZXhwIjoyMDkwODE0Mjc4fQ.EQVKzKbNuBZVlHB2-uft3NwCx5a7Y4ueSkrQSE24MaI'

const WA_TOKEN = process.env.WA_TOKEN!
const WA_PHONE_ID = process.env.WA_PHONE_NUMBER_ID!
const FURKAN_WA = '905446944067'

// Müdür UUID'leri
const MUDURLER = {
  ali:   '2f48de6d-2ef6-4f6d-994a-5cb5f45f1dd7',
  hazal: '336a49c8-a41b-48ce-98e5-23150d3db975',
  seray: 'df60517e-6989-4c71-bc6e-d85e1ac29153',
  anar:  '9d35baf2-b72d-482e-9fc9-63a0876fd4e9',
}

// Bütçe aralığı → müdür ataması
// 404 Strateji Formu seçenekleri:
//   "24.000 TL - 40.000 TL ..."  → ali/hazal (fermuar)
//   "40.000 TL - 75.000 TL ..."  → seray
//   "75.000 TL ve üzeri ..."     → anar
type BudgetRange = '24k-40k' | '40k-75k' | '75k+'

function parseBudget(raw: string): BudgetRange {
  const s = raw.toLowerCase().replace(/\s/g, '')
  if (s.includes('75.000') || s.includes('75k') || s.includes('veüzeri') || s.includes('üzeri')) return '75k+'
  if (s.includes('40.000') || s.includes('40k') || s.includes('kapsamlı') || s.includes('ileri')) return '40k-75k'
  return '24k-40k'
}

function budgetLabel(range: BudgetRange): string {
  const map: Record<BudgetRange, string> = {
    '24k-40k': '24.000 – 40.000 ₺',
    '40k-75k': '40.000 – 75.000 ₺',
    '75k+': '75.000 ₺ ve üzeri',
  }
  return map[range]
}

async function supabasePost(path: string, body: object) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  })
}

async function supabaseGet(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  })
  return res.json()
}

// Fermuar: Ali ve Hazal için mevcut lead sayısına göre dönüşümlü ata
async function fermuarMudur(): Promise<string> {
  const [aliData, hazalData] = await Promise.all([
    supabaseGet(`webhook_loglar?select=id&hedef=eq.lead:${MUDURLER.ali}`),
    supabaseGet(`webhook_loglar?select=id&hedef=eq.lead:${MUDURLER.hazal}`),
  ])
  const aliCount = Array.isArray(aliData) ? aliData.length : 0
  const hazalCount = Array.isArray(hazalData) ? hazalData.length : 0
  return aliCount <= hazalCount ? MUDURLER.ali : MUDURLER.hazal
}

function mudurAdi(id: string): string {
  const map: Record<string, string> = {
    [MUDURLER.ali]: 'Ali Ömer Yılmaz',
    [MUDURLER.hazal]: 'Hazal Aldağ',
    [MUDURLER.seray]: 'Seray Yalçın',
    [MUDURLER.anar]: 'Anar Veyisov',
  }
  return map[id] ?? 'Müdür'
}

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

  // Meta lead event
  const changes = body?.entry?.[0]?.changes ?? []
  for (const change of changes) {
    if (change.field !== 'leadgen') continue
    const { leadgen_id, form_id, page_id } = change.value ?? {}
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
    const butceRaw = fields['butce'] || fields['bütçe'] || fields['budget'] || fields['aylik_butce'] || fields['aylık_bütçe'] || '0'
    const sirket = fields['company_name'] || fields['sirket'] || fields['şirket'] || ''

    const butce = parseBudget(butceRaw)

    // Müdür ataması
    let mudurId: string
    let hedef: string

    if (butce === '75k+') {
      mudurId = MUDURLER.anar
      hedef = `lead:${MUDURLER.anar}`
    } else if (butce === '40k-75k') {
      mudurId = MUDURLER.seray
      hedef = `lead:${MUDURLER.seray}`
    } else {
      // 24k-40k → fermuar Ali/Hazal
      mudurId = await fermuarMudur()
      hedef = `lead:${mudurId}`
    }

    const leadPayload = {
      isim,
      telefon,
      email,
      sirket,
      butce: butceRaw,
      butceAralik: butce,
      butceLabel: budgetLabel(butce),
      mesaj: `Meta Reklam: ${leadData.ad_name || 'Bilinmiyor'}`,
      kaynak: 'Facebook Ads',
      leadDurum: 'yeni',
      cmoId: mudurId,
      metaLeadId: leadgen_id,
      metaFormId: form_id || leadData.form_id,
    }

    // Supabase'e kaydet
    await supabasePost('webhook_loglar', {
      hedef,
      mesaj: JSON.stringify(leadPayload),
      durum: 'beklemede',
    })

    // Furkan'a WA bildirimi
    const waMsg = `🎯 Yeni Meta Lead!\n\n👤 ${isim || 'Bilinmiyor'}\n📱 ${telefon || '—'}\n💰 Bütçe: ${budgetLabel(butce)}\n👔 Atanan: ${mudurAdi(mudurId)}`

    await sendWA(FURKAN_WA, waMsg).catch(e => console.error('WA bildirim hatası:', e.message))

    console.log(`Lead atandı → ${hedef} | ${isim} | ${budgetLabel(butce)}`)
  }

  return NextResponse.json({ ok: true })
}
