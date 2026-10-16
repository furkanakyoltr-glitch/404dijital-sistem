import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Twilio'nun <Dial action=...> callback'i — arama bittiğinde çağrılır.
export async function POST(req: NextRequest) {
  const form = await req.formData()
  const callSid = form.get('CallSid')?.toString() || ''
  const dialCallStatus = form.get('DialCallStatus')?.toString() || ''
  const dialCallDuration = form.get('DialCallDuration')?.toString()

  if (callSid) {
    try {
      await prisma.arama.updateMany({
        where: { callSid },
        data: {
          durum: dialCallStatus || 'bitti',
          sureSaniye: dialCallDuration ? parseInt(dialCallDuration, 10) : undefined,
        },
      })
    } catch (e) {
      console.error('Arama durum güncelleme hatası:', e)
    }
  }

  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', { headers: { 'Content-Type': 'text/xml' } })
}
