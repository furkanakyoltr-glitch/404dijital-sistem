export function parseWPMesaj(mesaj: string) {
  const trimmed = mesaj.trim()
  const parts = trimmed.split(/\s+/)
  const tip = parts[0]?.toUpperCase()

  // Format 1: "GİDER 5000 TL açıklama" veya "GELİR 15000 açıklama"
  if (['GİDER', 'GIDER', 'GELİR', 'GELIR'].includes(tip)) {
    const tutar = parseFloat(parts[1])
    if (isNaN(tutar)) return null
    const startIdx = parts[2]?.toUpperCase() === 'TL' ? 3 : 2
    const aciklama = parts.slice(startIdx).join(' ')
    const islemTipi = tip.includes('L') && tip.includes('İ') || tip === 'GELIR' ? 'GELIR' : 'GIDER'
    return { islemTipi, tutar, aciklama, kategori: kategoriTespit(aciklama) }
  }

  // Format 2: "100 TL taksiye ödendi" veya "500TL ödendi" → otomatik GELİR
  const tutarMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(?:TL|tl|₺)?\s+(.+)$/i)
  if (tutarMatch) {
    const tutar = parseFloat(tutarMatch[1].replace(',', '.'))
    const aciklama = tutarMatch[2].trim()
    const lower = aciklama.toLowerCase()
    // Ödeme/tahsilat kelimeleri varsa GELİR say
    if (lower.includes('ödendi') || lower.includes('odendi') || lower.includes('tahsilat') ||
        lower.includes('ödeme') || lower.includes('taksit') || lower.includes('taksiye') ||
        lower.includes('yatırdı') || lower.includes('gönderdi') || lower.includes('transfer')) {
      return { islemTipi: 'GELIR', tutar, aciklama, kategori: 'Tahsilat' }
    }
  }

  return null
}

function kategoriTespit(aciklama: string): string {
  const lower = aciklama.toLowerCase()
  if (lower.includes('reklam') || lower.includes('meta') || lower.includes('google') || lower.includes('tiktok')) return 'Reklam Bütçesi'
  if (lower.includes('kırtasiye') || lower.includes('ofis') || lower.includes('kira')) return 'Ofis Giderleri'
  if (lower.includes('maaş') || lower.includes('sgk') || lower.includes('prim')) return 'Çalışan Giderleri'
  if (lower.includes('adobe') || lower.includes('canva') || lower.includes('lisans')) return 'Yazılım & Lisans'
  if (lower.includes('vergi') || lower.includes('kdv')) return 'Vergi & Yasal'
  if (lower.includes('taksit') || lower.includes('ödeme') || lower.includes('tahsilat')) return 'Tahsilat'
  return 'Diğer'
}
