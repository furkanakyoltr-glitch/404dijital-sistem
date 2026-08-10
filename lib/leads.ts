import prisma from '@/lib/prisma'

export const LEAD_DURUMLAR = [
  { value: 'yeni_lead', label: 'Yeni Lead' },
  { value: 'on_gorusme', label: 'Ön Görüşme Yapılacak' },
  { value: 'gorusuldu', label: 'Görüşüldü' },
  { value: 'teklif_hazirlaniyor', label: 'Teklif Hazırlanıyor' },
  { value: 'teklif_gonderildi', label: 'Teklif Gönderildi' },
  { value: 'takip_edilecek', label: 'Takip Edilecek' },
  { value: 'kazandi', label: 'Kazandı' },
  { value: 'kaybedildi', label: 'Kaybedildi' },
] as const

export type LeadDurum = (typeof LEAD_DURUMLAR)[number]['value']

export function leadDurumLabel(durum: string): string {
  return LEAD_DURUMLAR.find(d => d.value === durum)?.label || durum
}

export async function createLead(data: {
  adSoyad?: string
  firmaAdi?: string
  telefon?: string
  email?: string
  hizmetIlgisi?: string
  mesaj?: string
  kaynak: string
}) {
  return prisma.lead.create({
    data: {
      adSoyad: data.adSoyad || null,
      firmaAdi: data.firmaAdi || null,
      telefon: data.telefon || null,
      email: data.email || null,
      hizmetIlgisi: data.hizmetIlgisi || null,
      mesaj: data.mesaj || null,
      kaynak: data.kaynak,
    },
  })
}
