// Instagram/Facebook paylaşım otomasyonu — Graph API ile Reels, görsel ve Facebook sayfa
// paylaşımı yapar. Her hesabın kendi sayfa erişim token'ı SosyalMedyaHesap.erisimTokeni'nde
// tutulur (WA_TOKEN gibi tek bir ortak token değil, her bağlı hesabın kendi token'ı var).

const GRAPH_VERSION = 'v21.0'
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_VERSION}`

type YayinSonuc = { ok: boolean; postId?: string; hata?: string }

async function containerDurumunuBekle(containerId: string, token: string, maxDeneme = 40): Promise<{ ok: boolean; hata?: string }> {
  for (let i = 0; i < maxDeneme; i++) {
    const res = await fetch(`${GRAPH_URL}/${containerId}?fields=status_code&access_token=${token}`)
    const data = await res.json()
    if (!res.ok) return { ok: false, hata: data?.error?.message || 'Container durumu alınamadı' }
    if (data.status_code === 'FINISHED') return { ok: true }
    if (data.status_code === 'ERROR') return { ok: false, hata: 'Meta video işlemeyi başaramadı (ERROR)' }
    await new Promise(r => setTimeout(r, 5000))
  }
  return { ok: false, hata: 'Video işleme zaman aşımına uğradı' }
}

// Instagram Reels yayınlar. videoUrl herkese açık, erişilebilir bir URL olmalı (Supabase Storage public URL gibi).
export async function instagramReelsYayinla(igHesapId: string, token: string, videoUrl: string, caption: string): Promise<YayinSonuc> {
  try {
    const olusturRes = await fetch(`${GRAPH_URL}/${igHesapId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'REELS',
        video_url: videoUrl,
        caption,
        access_token: token,
      }),
    })
    const olusturData = await olusturRes.json()
    if (!olusturRes.ok) return { ok: false, hata: olusturData?.error?.message || 'Reels container oluşturulamadı' }

    const containerId = olusturData.id
    const bekleme = await containerDurumunuBekle(containerId, token)
    if (!bekleme.ok) return { ok: false, hata: bekleme.hata }

    const yayinRes = await fetch(`${GRAPH_URL}/${igHesapId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: containerId, access_token: token }),
    })
    const yayinData = await yayinRes.json()
    if (!yayinRes.ok) return { ok: false, hata: yayinData?.error?.message || 'Reels yayınlanamadı' }

    return { ok: true, postId: yayinData.id }
  } catch (e: any) {
    return { ok: false, hata: e?.message || 'Ağ hatası' }
  }
}

// Instagram tek görsel paylaşımı (statik tasarım).
export async function instagramFotoYayinla(igHesapId: string, token: string, imageUrl: string, caption: string): Promise<YayinSonuc> {
  try {
    const olusturRes = await fetch(`${GRAPH_URL}/${igHesapId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }),
    })
    const olusturData = await olusturRes.json()
    if (!olusturRes.ok) return { ok: false, hata: olusturData?.error?.message || 'Görsel container oluşturulamadı' }

    const yayinRes = await fetch(`${GRAPH_URL}/${igHesapId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: olusturData.id, access_token: token }),
    })
    const yayinData = await yayinRes.json()
    if (!yayinRes.ok) return { ok: false, hata: yayinData?.error?.message || 'Görsel yayınlanamadı' }

    return { ok: true, postId: yayinData.id }
  } catch (e: any) {
    return { ok: false, hata: e?.message || 'Ağ hatası' }
  }
}

// Facebook sayfasına görsel + metinle paylaşım yapar.
export async function facebookPaylas(sayfaId: string, token: string, mesaj: string, medyaUrl?: string): Promise<YayinSonuc> {
  try {
    if (medyaUrl) {
      const res = await fetch(`${GRAPH_URL}/${sayfaId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: medyaUrl, caption: mesaj, access_token: token }),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, hata: data?.error?.message || 'Facebook paylaşımı başarısız' }
      return { ok: true, postId: data.post_id || data.id }
    }
    const res = await fetch(`${GRAPH_URL}/${sayfaId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: mesaj, access_token: token }),
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, hata: data?.error?.message || 'Facebook paylaşımı başarısız' }
    return { ok: true, postId: data.id }
  } catch (e: any) {
    return { ok: false, hata: e?.message || 'Ağ hatası' }
  }
}

// Admin bir sayfa erişim token'ı yapıştırdığında sayfa adı + bağlı IG hesabını doğrulamak için kullanılır.
export async function sayfaBilgisiGetir(sayfaId: string, token: string): Promise<{ ok: boolean; adi?: string; igHesapId?: string; hata?: string }> {
  try {
    const res = await fetch(`${GRAPH_URL}/${sayfaId}?fields=name,instagram_business_account&access_token=${token}`)
    const data = await res.json()
    if (!res.ok) return { ok: false, hata: data?.error?.message || 'Sayfa bilgisi alınamadı' }
    return { ok: true, adi: data.name, igHesapId: data.instagram_business_account?.id }
  } catch (e: any) {
    return { ok: false, hata: e?.message || 'Ağ hatası' }
  }
}
