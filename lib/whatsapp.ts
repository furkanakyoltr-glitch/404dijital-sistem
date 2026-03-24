const WA_TOKEN = process.env.WA_TOKEN
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID
const FURKAN_NO = '+905446844067'

async function sendWAMessage(to: string, text: string): Promise<boolean> {
  if (!WA_TOKEN || !WA_PHONE_NUMBER_ID) {
    console.warn('WhatsApp env vars eksik')
    return false
  }
  const phone = to.replace(/\s+/g, '').replace(/^0/, '90').replace(/^\+/, '')
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${WA_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WA_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: text },
        }),
      }
    )
    if (!res.ok) {
      const err = await res.text()
      console.error('WA gönderim hatası:', err)
      return false
    }
    return true
  } catch (e) {
    console.error('WA fetch hatası:', e)
    return false
  }
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
  const mesaj =
    `Merhaba ${yetkiliKisi} Bey/Hanım,\n\n` +
    `404 Dijital olarak *${firmaAdi}* için hazırladığımız teklif hazır! 🚀\n\n` +
    `📦 Paket: ${paketAdi}\n` +
    `💰 Tutar: ₺${toplam.toLocaleString('tr-TR')}\n` +
    `🔗 Teklif: ${teklifLink}\n\n` +
    `Giriş bilgileriniz:\n` +
    `• Kasa No: *${kasaNo}*\n\n` +
    `Teklife göz attıktan sonra onaylamak için "Onaylıyorum ${kasaNo}" yazabilirsiniz.\n\n` +
    `Detaylı konuşmak için beni arayabilirsiniz: *+90 544 684 40 67*`

  const ok = await sendWAMessage(telefon, mesaj)
  if (ok) {
    // Furkan'a da bilgi ver
    await sendWAMessage(
      FURKAN_NO,
      `📤 Teklif gönderildi → ${firmaAdi} (${kasaNo})\nTelefon: ${telefon}\nTutar: ₺${toplam.toLocaleString('tr-TR')}`
    )
  }
  return ok
}

export async function sendFurkanBildirim(mesaj: string) {
  return sendWAMessage(FURKAN_NO, mesaj)
}
