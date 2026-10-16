import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Twilio recordingStatusCallback — kayıt tamamlandığında çağrılır.
export async function POST(req: NextRequest) {
  const form = await req.formData()
  const callSid = form.get('CallSid')?.toString() || ''
  const recordingUrl = form.get('RecordingUrl')?.toString()
  const recordingDuration = form.get('RecordingDuration')?.toString()

  if (callSid && recordingUrl) {
    try {
      await prisma.arama.updateMany({
        where: { callSid },
        data: {
          kayitUrl: `${recordingUrl}.mp3`,
          sureSaniye: recordingDuration ? parseInt(recordingDuration, 10) : undefined,
        },
      })
    } catch (e) {
      console.error('Arama kayıt URL güncelleme hatası:', e)
    }
  }

  return NextResponse.json({ ok: true })
}
