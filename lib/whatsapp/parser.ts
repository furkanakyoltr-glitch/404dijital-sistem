export function parseWPMesaj(mesaj: string) {
  const parts = mesaj.trim().split(/\s+/)
  const tip = parts[0]?.toUpperCase()
  if (!['GİDER', 'GIDER', 'GELİR', 'GELIR'].includes(tip)) return null
  const tutar = parseFloat(parts[1])
  if (isNaN(tutar)) return null
  const startIdx = parts[2]?.toUpperCase() === 'TL' ? 3 : 2
  const aciklama = parts.slice(startIdx).join(' ')
  let kategori = 'Diğer'
  const lower = aciklama.toLowerCase()
  if (lower.includes('reklam') || lower.includes('meta') || lower.includes('google') || lower.includes('tiktok')) kategori = 'Reklam Bütçesi'
  else if (lower.includes('kırtasiye') || lower.includes('ofis') || lower.includes('kira')) kategori = 'Ofis Giderleri'
  else if (lower.includes('maaş') || lower.includes('sgk') || lower.includes('prim')) kategori = 'Çalışan Giderleri'
  else if (lower.includes('adobe') || lower.includes('canva') || lower.includes('lisans')) kategori = 'Yazılım & Lisans'
  else if (lower.includes('vergi') || lower.includes('kdv')) kategori = 'Vergi & Yasal'
  const islemTipi = tip.startsWith('G') && tip.includes('L') ? 'GELIR' : 'GIDER'
  return { islemTipi, tutar, aciklama, kategori }
}
