// Service Account ile Google Calendar'a sunucu tarafından event yazma — ek npm paketi gerektirmez.
// Gerekli env değişkenleri: GOOGLE_SA_CLIENT_EMAIL, GOOGLE_SA_PRIVATE_KEY, GOOGLE_CALENDAR_ID

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function getAccessToken(): Promise<string | null> {
  const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!clientEmail || !privateKey) return null

  const crypto = await import('crypto')
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claims = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(unsigned)
  signer.end()
  const signature = base64url(signer.sign(privateKey))
  const jwt = `${unsigned}.${signature}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!res.ok) {
    console.error('Google Calendar token hatası:', await res.text())
    return null
  }
  const data = await res.json()
  return data.access_token || null
}

export async function takvimeEventEkle(params: {
  tarih: string // YYYY-MM-DD
  saat: string // HH:MM
  sureDakika: number
  baslik: string
  aciklama?: string
}): Promise<{ ok: boolean; eventId?: string; hata?: string }> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  if (!calendarId) return { ok: false, hata: 'GOOGLE_CALENDAR_ID tanımlı değil' }

  const token = await getAccessToken()
  if (!token) return { ok: false, hata: 'Google Calendar kimlik doğrulaması başarısız (service account env eksik olabilir)' }

  const [yil, ay, gun] = params.tarih.split('-').map(Number)
  const [saat, dakika] = params.saat.split(':').map(Number)
  const baslangic = new Date(Date.UTC(yil, ay - 1, gun, saat - 3, dakika)) // Europe/Istanbul (UTC+3) -> UTC
  const bitis = new Date(baslangic.getTime() + params.sureDakika * 60 * 1000)

  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: params.baslik,
          description: params.aciklama || '',
          start: { dateTime: baslangic.toISOString(), timeZone: 'Europe/Istanbul' },
          end: { dateTime: bitis.toISOString(), timeZone: 'Europe/Istanbul' },
        }),
      }
    )
    const data = await res.json()
    if (!res.ok) {
      console.error('Google Calendar event oluşturma hatası:', data)
      return { ok: false, hata: data?.error?.message || 'Bilinmeyen hata' }
    }
    return { ok: true, eventId: data.id }
  } catch (e: any) {
    console.error('Google Calendar fetch hatası:', e)
    return { ok: false, hata: e?.message || 'Ağ hatası' }
  }
}

export async function takvimdenMeşgulSaatleriGetir(tarih: string): Promise<string[] | null> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  const token = await getAccessToken()
  if (!calendarId || !token) return null

  const timeMin = `${tarih}T00:00:00+03:00`
  const timeMax = `${tarih}T23:59:59+03:00`
  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const saatler: string[] = []
    for (const ev of data.items || []) {
      const start = ev.start?.dateTime
      if (!start) continue
      const d = new Date(start)
      const istanbulSaat = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Istanbul' }).format(d)
      saatler.push(istanbulSaat)
    }
    return saatler
  } catch {
    return null
  }
}
