import prisma from './prisma'
import { sendWAText, sendWATemplate } from './whatsapp'

type LeadBildirimVeri = {
  adSoyad?: string | null
  telefon?: string | null
  firmaAdi?: string | null
  mesaj?: string | null
  kaynak?: string | null
}

export async function leadGeldiBildir(lead: LeadBildirimVeri) {
  try {
    const bildirilecekler = await prisma.admin.findMany({
      where: { departman: { in: ['yonetim', 'satis'] }, telefon: { not: null } },
      select: { name: true, telefon: true },
    })

    if (bildirilecekler.length === 0) return

    const isim = lead.adSoyad || lead.firmaAdi || 'İsimsiz'
    const telefon = lead.telefon || 'Telefon yok'
    const kaynak = lead.kaynak || 'Web Sitesi'

    const serbestMetin = `🔔 Yeni lead!\n\nİsim: ${isim}\nTelefon: ${telefon}\nKaynak: ${kaynak}${lead.mesaj ? `\nMesaj: ${lead.mesaj}` : ''}\n\nEn kısa sürede ara, lead soğumasın.`

    for (const admin of bildirilecekler) {
      if (!admin.telefon) continue
      const serbestSonuc = await sendWAText(admin.telefon, serbestMetin)
      if (!serbestSonuc.ok) {
        await sendWATemplate(admin.telefon, 'yeni_lead_bildirimi', [isim, telefon, kaynak])
      }
    }
  } catch (e) {
    console.error('Lead bildirimi gönderme hatası:', e)
  }
}
