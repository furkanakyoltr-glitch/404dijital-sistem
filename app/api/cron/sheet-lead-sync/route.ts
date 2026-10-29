import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createLead } from '@/lib/leads'

// Meta Lead Ads -> Google Sheets senkronu.
// 404dijital.com'un kendi webhook'u bazı lead formlarını yakalamıyor; bu formlar
// ayrı bir otomasyonla doğrudan bu Google Sheet'e düşüyor. Bu route periyodik olarak
// (Railway Cron Job, teklif-hatirlatici-cron ile aynı desen) çağrılır, Sheet'teki
// yeni satırları bulur, admin panelindeki Lead tablosuna işler ve bildirim gönderir.

const SHEET_ID = '1wFkntLQMFwXsGAGu3LJgSCugV5FvYmiro4c3-DCfNng'

const SEKMELER = [
  { gid: '871783915', ad: '404_Ana_Hizmet_Secimi_v1' },
  { gid: '204941143', ad: 'Detaylı form' },
  { gid: '1944929643', ad: 'Standart form' },
]

function csvSatirlariniAyikla(csv: string): string[][] {
  const satirlar: string[][] = []
  let satir: string[] = []
  let alan = ''
  let tirnakIcinde = false

  for (let i = 0; i < csv.length; i++) {
    const c = csv[i]
    const sonraki = csv[i + 1]

    if (tirnakIcinde) {
      if (c === '"' && sonraki === '"') { alan += '"'; i++ }
      else if (c === '"') { tirnakIcinde = false }
      else { alan += c }
    } else {
      if (c === '"') tirnakIcinde = true
      else if (c === ',') { satir.push(alan); alan = '' }
      else if (c === '\n') { satir.push(alan); satirlar.push(satir); satir = []; alan = '' }
      else if (c === '\r') { /* yoksay */ }
      else { alan += c }
    }
  }
  if (alan || satir.length) { satir.push(alan); satirlar.push(satir) }
  return satirlar.filter(s => s.length > 1 || (s[0] && s[0].trim()))
}

function alanBul(baslikIndeksi: Record<string, number>, satir: string[], ...adaylar: string[]): string | null {
  for (const aday of adaylar) {
    const idx = baslikIndeksi[aday]
    if (idx !== undefined && satir[idx]?.trim()) return satir[idx].trim()
  }
  return null
}

// Railway cron veya harici bir cron servisi tarafından çağrılır
// Örnek: her 5 dakikada bir GET /api/cron/sheet-lead-sync?secret=...
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.WP_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sonuclar: Record<string, { tarandi: number; eklendi: number; hata?: string }> = {}

  for (const sekme of SEKMELER) {
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${sekme.gid}`
      const res = await fetch(csvUrl, { cache: 'no-store' })
      if (!res.ok) {
        sonuclar[sekme.ad] = { tarandi: 0, eklendi: 0, hata: `CSV alınamadı (${res.status}) — sheet paylaşımı "bağlantıya sahip herkes görüntüleyebilir" mi?` }
        continue
      }
      const csv = await res.text()
      const satirlar = csvSatirlariniAyikla(csv)
      if (satirlar.length < 2) { sonuclar[sekme.ad] = { tarandi: 0, eklendi: 0 }; continue }

      const basliklar = satirlar[0].map(b => b.trim())
      const baslikIndeksi: Record<string, number> = {}
      basliklar.forEach((b, i) => { baslikIndeksi[b] = i })

      let eklendi = 0
      const veriSatirlari = satirlar.slice(1)

      for (const satir of veriSatirlari) {
        const sheetId = satir[baslikIndeksi['id']]?.trim()
        if (!sheetId) continue

        const kaynakEtiket = `Meta Reklam (sheet:${sekme.ad}, id:${sheetId})`
        const mevcut = await prisma.lead.findFirst({ where: { kaynak: { contains: sheetId } } })
        if (mevcut) continue

        const adSoyad = alanBul(baslikIndeksi, satir, 'first name', 'full_name', 'ad', 'isim', 'name')
        const telefon = alanBul(baslikIndeksi, satir, 'phone', 'telefon')
        const email = alanBul(baslikIndeksi, satir, 'email', 'e-posta', 'eposta')
        const firmaAdi = alanBul(baslikIndeksi, satir, 'şirket_adı', 'firma_adi', 'company_name')
        const hizmetIlgisi = alanBul(baslikIndeksi, satir, 'hangi_sektörde', 'sektor')

        // Sheet'teki TÜM soru-cevapları (id/created_time gibi meta kolonlar hariç) kaybetmeden
        // formYanitlari'na yaz — panelde tek tek sorular görünsün, hiçbiri sheet'te kalıp kaybolmasın.
        const metaKolonlar = new Set(['id', 'created_time', 'ad_id', 'ad_name', 'adset_id', 'adset_name', 'campaign_id', 'campaign_name', 'form_id', 'is_organic', 'platform'])
        const formYanitlari: Record<string, string> = {}
        basliklar.forEach((baslik, i) => {
          const deger = satir[i]?.trim()
          if (baslik && deger && !metaKolonlar.has(baslik.toLowerCase())) {
            formYanitlari[baslik] = deger
          }
        })
        const mesajMetni = Object.entries(formYanitlari)
          .map(([soru, cevap]) => `${soru}: ${cevap}`)
          .join('\n')

        await createLead({
          adSoyad: adSoyad || undefined,
          telefon: telefon || undefined,
          email: email || undefined,
          firmaAdi: firmaAdi || undefined,
          hizmetIlgisi: hizmetIlgisi || undefined,
          mesaj: mesajMetni || undefined,
          kaynak: kaynakEtiket,
          formYanitlari,
        })
        eklendi++
      }

      sonuclar[sekme.ad] = { tarandi: veriSatirlari.length, eklendi }
    } catch (e: any) {
      sonuclar[sekme.ad] = { tarandi: 0, eklendi: 0, hata: e?.message || String(e) }
    }
  }

  return NextResponse.json({ ok: true, sonuclar })
}
