const WA_TOKEN = process.env.WA_TOKEN
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID
const FURKAN_NO = '+905446844067'

function formatPhone(to: string): string {
  return to.replace(/\s+/g, '').replace(/^\+/, '').replace(/^0/, '90')
}

async function sendWATemplate(to: string, templateName: string, params: string[]): Promise<boolean> {
  if (!WA_TOKEN || !WA_PHONE_NUMBER_ID) return false
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${WA_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WA_TOKEN}` },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formatPhone(to),
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'tr' },
            components: [{ type: 'body', parameters: params.map(text => ({ type: 'text', text })) }],
          },
        }),
      }
    )
    if (!res.ok) { console.error('WA template hatası:', templateName, await res.text()); return false }
    return true
  } catch (e) { console.error('WA template fetch hatası:', e); return false }
}

export async function sendTeklifWP(params: {
  telefon: string; yetkiliKisi: string; firmaAdi: string
  kasaNo: string; paketAdi: string; toplam: number; magicToken?: string
}) {
  const { telefon, yetkiliKisi, firmaAdi, kasaNo, paketAdi, toplam, magicToken } = params
  const teklifLink = magicToken
    ? `https://teklif.404dijital.com/kasa/${kasaNo}?token=${magicToken}`
    : `https://teklif.404dijital.com/kasa/${kasaNo}`
  return sendWATemplate(telefon, 'teklif_bildirimi', [
    yetkiliKisi, firmaAdi, paketAdi, toplam.toLocaleString('tr-TR'), teklifLink, kasaNo,
  ])
}

export async function sendOnayAdminBildirim(firmaAdi: string, kasaNo: string): Promise<boolean> {
  return sendWATemplate(FURKAN_NO, 'onay_admin_bildirimi', [firmaAdi, kasaNo])
}

// Serbest metin yanıt — sadece müşterinin son 24 saat içinde mesaj attığı "müşteri hizmeti penceresi" içinde çalışır.
// Pencere kapalıysa WhatsApp bu isteği reddeder; o durumda onaylı bir şablon (template) mesajı gerekir.
export async function sendWAText(to: string, mesaj: string): Promise<{ ok: boolean; waMesajId?: string; hata?: string }> {
  if (!WA_TOKEN || !WA_PHONE_NUMBER_ID) return { ok: false, hata: 'WA_TOKEN/WA_PHONE_NUMBER_ID tanımlı değil' }
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${WA_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WA_TOKEN}` },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formatPhone(to),
          type: 'text',
          text: { body: mesaj },
        }),
      }
    )
    const data = await res.json()
    if (!res.ok) {
      console.error('WA metin gönderim hatası:', data)
      return { ok: false, hata: data?.error?.message || 'Bilinmeyen hata' }
    }
    return { ok: true, waMesajId: data?.messages?.[0]?.id }
  } catch (e: any) {
    console.error('WA metin fetch hatası:', e)
    return { ok: false, hata: e?.message || 'Ağ hatası' }
  }
}
