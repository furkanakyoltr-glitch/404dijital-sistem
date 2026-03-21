export async function triggerMakeWebhook(url: string, data: Record<string, unknown>) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.ok
  } catch { return false }
}

export async function sendWhatsAppBildirimi(mesaj: string) {
  return triggerMakeWebhook(process.env.MAKE_WHATSAPP_WEBHOOK!, { mesaj, numara: process.env.WHATSAPP_NUMBER })
}

export async function sendTeklifOnayBildirimi(firmaAdi: string, kasaNo: string) {
  await sendWhatsAppBildirimi(`✅ ${firmaAdi} teklifi onayladı! Kasa: #${kasaNo} - Hemen aksiyon alın.`)
}
