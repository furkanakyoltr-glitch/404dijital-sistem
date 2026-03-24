const WA_TOKEN = process.env.WA_TOKEN
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID
const FURKAN_NO = '+905446844067'

function formatPhone(to: string): string {
  return to.replace(/\s+/g, '').replace(/^\+/, '').replace(/^0/, '90')
}

async function sendWAMessage(to: string, text: string): Promise<boolean> {
  if (!WA_TOKEN || !WA_PHONE_NUMBER_ID) {
    console.warn('WhatsApp env vars eksik')
    return false
  }
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
          text: { body: text },
        }),
      }
    )
    if (!res.ok) { console.error('WA text hatası:', await res.text()); return false }
    return true
  } catch (e) { console.error('WA fetch hatası:', e); return false }
}

async function sendWATemplate(to: string, params: string[]): Promise<boolean> {
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
            name: 'teklif_bildirimi',
            language: { code: 'tr' },
            components: [{
              type: 'body',
              parameters: params.map(text => ({ type: 'text', text })),
            }],
          },
        }),
      }
    )
    if (!res.ok) {
      const err = await res.text()
      console.error('WA template hatası:', err)
      return false
    }
    return true
  } catch (e) { console.error('WA template fetch hatası:', e); return false }
}

export async function sendTeklifWP(params: {
  telefon: string
  yetkiliKisi: string
  firmaAdi: string
  kasaNo: string
  paketAdi: string
  toplam: number
}) {
  const { telefon, yetkiliKisi, firmaAdi, kasaNo, paketAdi, toplam } = params
  const teklifLink = `https://teklif.404dijital.com/${kasaNo}`
  const toplamStr = toplam.toLocaleString('tr-TR')

  // Template mesajı gönder (herhangi bir numaraya çalışır)
  const ok = await sendWATemplate(telefon, [
    yetkiliKisi,
    firmaAdi,
    paketAdi,
    toplamStr,
    teklifLink,
    kasaNo,
  ])

  if (ok) {
    // Furkan'a bilgi ver (normal metin - kendi numarası)
    await sendWAMessage(
      FURKAN_NO,
      `Teklif gonderildi: ${firmaAdi} (${kasaNo})\nTelefon: ${telefon}\nTutar: ${toplamStr} TL`
    )
  }
  return ok
}

export async function sendFurkanBildirim(mesaj: string) {
  return sendWAMessage(FURKAN_NO, mesaj)
}
