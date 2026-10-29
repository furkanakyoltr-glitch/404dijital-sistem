import { NextRequest, NextResponse } from 'next/server'
import { sendWAFile, sendWATemplate } from '@/lib/whatsapp'

// Potansiyel müşteri araştırma raporu (PDF) otomatik üretilince buraya POST edilir,
// Furkan'ın WhatsApp'ına gönderilir. Secret ile korunur (diğer cron route'larla aynı desen).
// Admin oturumu gerektirmez — bu, panel dışından (local araştırma döngüsünden) çağrılır.

const FURKAN_NO = '+905446844067'
const MAX_BOYUT = 15 * 1024 * 1024

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.WP_WEBHOOK_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const form = await req.formData()
    const firmaAdi = (form.get('firmaAdi') as string | null)?.trim() || 'Potansiyel Müşteri'
    const dosya = form.get('dosya') as File | null
    if (!dosya) return NextResponse.json({ error: 'dosya zorunlu' }, { status: 400 })
    if (dosya.size > MAX_BOYUT) return NextResponse.json({ error: 'Dosya 15MB üzeri olamaz' }, { status: 400 })

    const buffer = Buffer.from(await dosya.arrayBuffer())
    const sonuc = await sendWAFile(FURKAN_NO, buffer, dosya.type || 'application/pdf', dosya.name, `📊 ${firmaAdi} — potansiyel müşteri analiz raporu`)

    if (!sonuc.ok) {
      // 24 saatlik müşteri hizmeti penceresi kapalıysa onaylı şablonla haber ver (dosya olmadan).
      await sendWATemplate(FURKAN_NO, 'yeni_lead_bildirimi', [firmaAdi, 'Rapor hazır', 'Otomatik Araştırma'])
      return NextResponse.json({ ok: false, hata: sonuc.hata, fallback: 'template_gonderildi' })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Rapor gönderim hatası:', err)
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 })
  }
}
