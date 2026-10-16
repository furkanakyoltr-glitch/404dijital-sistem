import { NextRequest, NextResponse } from 'next/server'

const FURKAN_NO = '+905446844067'
const BASE_URL = 'https://admin.404dijital.com'

// Twilio bu numarayı her aradığında çağırır. KVKK gereği kayıt anonsu çalar,
// sonra aramayı gerçek telefona yönlendirir ve kaydı başlatır.
export async function POST(req: NextRequest) {
  const form = await req.formData()
  const callSid = form.get('CallSid')?.toString() || ''
  const from = form.get('From')?.toString() || ''
  const to = form.get('To')?.toString() || ''

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="tr-TR" voice="Polly.Filiz">Bu görüşme kalite ve eğitim amacıyla kayıt altına alınmaktadır.</Say>
  <Dial record="record-from-answer" recordingStatusCallback="${BASE_URL}/api/telefon/kayit" recordingStatusCallbackEvent="completed" action="${BASE_URL}/api/telefon/durum" timeout="25">
    <Number>${FURKAN_NO}</Number>
  </Dial>
</Response>`

  // Arama kaydını hemen oluştur (durum callback'i daha sonra günceller)
  try {
    const prisma = (await import('@/lib/prisma')).default
    await prisma.arama.upsert({
      where: { callSid },
      create: { callSid, kimden: from, kime: to, durum: 'basladi' },
      update: {},
    })
  } catch (e) {
    console.error('Arama kaydı oluşturma hatası:', e)
  }

  return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } })
}
