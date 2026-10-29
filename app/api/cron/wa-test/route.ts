import { NextRequest, NextResponse } from 'next/server'
import { sendWAText } from '@/lib/whatsapp'

// Geçici teşhis endpoint'i — WA mesaj teslimini test eder. İş bitince silinecek.
const FURKAN_NO = '+905446844067'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.WP_WEBHOOK_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sonuc = await sendWAText(FURKAN_NO, '🧪 Test mesajı — bu geldiyse WA entegrasyonu çalışıyor.')
  return NextResponse.json(sonuc)
}
