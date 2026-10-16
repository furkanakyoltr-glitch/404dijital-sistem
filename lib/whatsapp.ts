const WA_TOKEN = process.env.WA_TOKEN
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID
const FURKAN_NO = '+905446844067'

function formatPhone(to: string): string {
  return to.replace(/\s+/g, '').replace(/^\+/, '').replace(/^0/, '90')
}

export async function sendWATemplate(to: string, templateName: string, params: string[]): Promise<boolean> {
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

// Dosyayı WhatsApp'ın medya sunucusuna yükler, mesajda referans verilecek media id döner.
// Sadece müşteri hizmeti penceresi (son 24 saat) içinde gönderilebilir (serbest metin ile aynı kural).
async function uploadWAMedia(dosya: Buffer, mimeType: string, dosyaAdi: string): Promise<{ ok: boolean; mediaId?: string; hata?: string }> {
  if (!WA_TOKEN || !WA_PHONE_NUMBER_ID) return { ok: false, hata: 'WA_TOKEN/WA_PHONE_NUMBER_ID tanımlı değil' }
  try {
    const form = new FormData()
    form.append('messaging_product', 'whatsapp')
    form.append('file', new Blob([new Uint8Array(dosya)], { type: mimeType }), dosyaAdi)
    const res = await fetch(`https://graph.facebook.com/v19.0/${WA_PHONE_NUMBER_ID}/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${WA_TOKEN}` },
      body: form,
    })
    const data = await res.json()
    if (!res.ok) {
      console.error('WA medya yükleme hatası:', data)
      return { ok: false, hata: data?.error?.message || 'Medya yüklenemedi' }
    }
    return { ok: true, mediaId: data.id }
  } catch (e: any) {
    console.error('WA medya yükleme fetch hatası:', e)
    return { ok: false, hata: e?.message || 'Ağ hatası' }
  }
}

// Daha önce uploadWAMedia ile yüklenen bir dosyayı resim/belge olarak gönderir.
async function sendWAMediaMessage(
  to: string,
  mediaId: string,
  tip: 'image' | 'document',
  dosyaAdi?: string,
  caption?: string
): Promise<{ ok: boolean; waMesajId?: string; hata?: string }> {
  if (!WA_TOKEN || !WA_PHONE_NUMBER_ID) return { ok: false, hata: 'WA_TOKEN/WA_PHONE_NUMBER_ID tanımlı değil' }
  try {
    const medyaObj: Record<string, string> = { id: mediaId }
    if (caption) medyaObj.caption = caption
    if (tip === 'document' && dosyaAdi) medyaObj.filename = dosyaAdi

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${WA_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WA_TOKEN}` },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formatPhone(to),
          type: tip,
          [tip]: medyaObj,
        }),
      }
    )
    const data = await res.json()
    if (!res.ok) {
      console.error('WA medya gönderim hatası:', data)
      return { ok: false, hata: data?.error?.message || 'Bilinmeyen hata' }
    }
    return { ok: true, waMesajId: data?.messages?.[0]?.id }
  } catch (e: any) {
    console.error('WA medya gönderim fetch hatası:', e)
    return { ok: false, hata: e?.message || 'Ağ hatası' }
  }
}

// Panelden dosya eki gönderimi (PDF teklif, görsel vs.) için tek çağrıda yükle + gönder.
export async function sendWAFile(
  to: string,
  dosya: Buffer,
  mimeType: string,
  dosyaAdi: string,
  caption?: string
): Promise<{ ok: boolean; waMesajId?: string; tip?: 'image' | 'document'; hata?: string }> {
  const tip: 'image' | 'document' = mimeType.startsWith('image/') ? 'image' : 'document'
  const yukle = await uploadWAMedia(dosya, mimeType, dosyaAdi)
  if (!yukle.ok || !yukle.mediaId) return { ok: false, hata: yukle.hata || 'Medya yüklenemedi' }
  const gonder = await sendWAMediaMessage(to, yukle.mediaId, tip, dosyaAdi, caption)
  return { ...gonder, tip }
}

export async function sendWATemplateDetayli(to: string, templateName: string, params: string[]): Promise<{ ok: boolean; hata?: string }> {
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
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'tr' },
            components: params.length ? [{ type: 'body', parameters: params.map(text => ({ type: 'text', text })) }] : [],
          },
        }),
      }
    )
    if (!res.ok) {
      const hataMetni = await res.text()
      console.error('WA template detaylı hata:', templateName, hataMetni)
      let hata = hataMetni
      try { hata = JSON.parse(hataMetni)?.error?.error_user_msg || JSON.parse(hataMetni)?.error?.message || hataMetni } catch {}
      return { ok: false, hata }
    }
    return { ok: true }
  } catch (e: any) {
    console.error('WA template detaylı fetch hatası:', e)
    return { ok: false, hata: e?.message || 'Bağlantı hatası' }
  }
}

const WABA_ID = '1381364330434940'

function sablonAdiUret(baslik: string): string {
  const temel = baslik
    .toLocaleLowerCase('tr')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
  return `${temel}_${Date.now().toString().slice(-5)}`
}

// Panelden yeni WhatsApp mesaj şablonu oluşturup Meta'ya onay için gönderir.
// govde içindeki {{1}}, {{2}}... placeholder'lar örnek değerlerle birlikte iletilmeli.
export async function metaSablonOlustur(params: {
  baslik: string
  kategori: 'MARKETING' | 'UTILITY'
  govde: string
  ornekDegerler: string[]
}): Promise<{ ok: boolean; templateId?: string; templateName?: string; durum?: string; hata?: string }> {
  if (!WA_TOKEN) return { ok: false, hata: 'WA_TOKEN tanımlı değil' }
  const templateName = sablonAdiUret(params.baslik)
  try {
    const body: any = {
      name: templateName,
      language: 'tr',
      category: params.kategori,
      components: [
        {
          type: 'BODY',
          text: params.govde,
          ...(params.ornekDegerler.length ? { example: { body_text: [params.ornekDegerler] } } : {}),
        },
      ],
    }
    const res = await fetch(`https://graph.facebook.com/v19.0/${WABA_ID}/message_templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WA_TOKEN}` },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) {
      console.error('Meta şablon oluşturma hatası:', data)
      return { ok: false, hata: data?.error?.error_user_msg || data?.error?.message || 'Meta şablon oluşturulamadı' }
    }
    return { ok: true, templateId: data.id, templateName, durum: data.status || 'PENDING' }
  } catch (e: any) {
    console.error('Meta şablon oluşturma fetch hatası:', e)
    return { ok: false, hata: e?.message || 'Bağlantı hatası' }
  }
}

export async function metaSablonDurumGetir(templateId: string): Promise<{ ok: boolean; durum?: string; hata?: string }> {
  if (!WA_TOKEN) return { ok: false, hata: 'WA_TOKEN tanımlı değil' }
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${templateId}?fields=status`, {
      headers: { Authorization: `Bearer ${WA_TOKEN}` },
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, hata: data?.error?.message || 'Durum alınamadı' }
    return { ok: true, durum: data.status }
  } catch (e: any) {
    return { ok: false, hata: e?.message || 'Bağlantı hatası' }
  }
}
