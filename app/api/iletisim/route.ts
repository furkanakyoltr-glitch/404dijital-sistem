import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const MAKE_WEBHOOK = 'https://hook.eu1.make.com/9psm572qyzuk0gw0ay2nyc1ws3qd6cr7'

const panelSupabase = createClient(
  'https://qiffhdcoxzdxrcywciwq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpZmZoZGNveHpkeHJjeXdjaXdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIzODI3OCwiZXhwIjoyMDkwODE0Mjc4fQ.EQVKzKbNuBZVlHB2-uft3NwCx5a7Y4ueSkrQSE24MaI'
)

const MUDURLER = [
  { id: '9d35baf2-b72d-482e-9fc9-63a0876fd4e9', name: 'Anar Veyisov',    phone: '905521341005', uzmanlik: ['B2B', 'E-Ticaret'] },
  { id: '2f48de6d-2ef6-4f6d-994a-5cb5f45f1dd7', name: 'Ali Ömer Yılmaz', phone: '905530110555', uzmanlik: ['Sanayi', 'Üretim'] },
  { id: '336a49c8-a41b-48ce-98e5-23150d3db975', name: 'Hazal Aldağ',      phone: '905335015080', uzmanlik: ['Gıda', 'Hizmet'] },
  { id: 'df60517e-6989-4c71-bc6e-d85e1ac29153', name: 'Seray Yalçın',     phone: '905071601336', uzmanlik: ['Spor', 'Lifestyle', 'FMCG', 'B2B'] },
]

async function insertLeadToPanel(body: Record<string, string>) {
  const sektor = (body.hizmet || body.sektor || '').toLowerCase()

  const capacity = await Promise.all(
    MUDURLER.map(async (m) => {
      const { count } = await panelSupabase
        .from('musteriler')
        .select('*', { count: 'exact', head: true })
        .eq('cmo_id', m.id)
        .eq('arama_durumu', 'bekliyor')
      return { ...m, bekleyen: count || 0 }
    })
  )

  const sektorEslesen = capacity.filter(m =>
    sektor && m.uzmanlik.some(u => sektor.includes(u.toLowerCase()) || u.toLowerCase().includes(sektor))
  )

  const musait = (sektorEslesen.length > 0 ? sektorEslesen : capacity)
    .filter(m => m.bekleyen < 5)
    .sort((a, b) => a.bekleyen - b.bekleyen)

  const assigned = musait[0] ?? null

  await panelSupabase.from('musteriler').insert({
    firma_adi:     body.isim || 'Lead - ' + new Date().toLocaleDateString('tr-TR'),
    yetkili_kisi:  body.isim || '',
    email:         body.email || '',
    phone:         body.telefon || '',
    sektor:        body.hizmet || 'Belirtilmedi',
    cmo_id:        assigned?.id ?? null,
    durum:         'aday',
    onay_durumu:   'beklemede',
    arama_durumu:  'bekliyor',
    sozlesme_turu: 'aylik',
    notlar: JSON.stringify({
      kaynak: '404dijital_form',
      mesaj:  body.mesaj || '',
    }),
  })
}

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

    // Otomatik karşılama mesajı
    if (body.telefon) {
      fetch(`${baseUrl}/api/lead-wa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: body.isim, phone: body.telefon }),
      }).catch(() => {})
    }

    // Panele lead ekle ve müdür ata
    insertLeadToPanel(body).catch(err => console.error('Panel lead hatası:', err))

    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Islem basarisiz' }, { status: 500 }) }
}
