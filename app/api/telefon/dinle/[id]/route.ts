import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Twilio kayıtları Basic Auth gerektirir — admin oturumuyla panelden dinlenebilmesi için proxy.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const arama = await prisma.arama.findUnique({ where: { id: params.id } })
  if (!arama?.kayitUrl) return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 })

  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) return NextResponse.json({ error: 'Twilio bilgileri eksik' }, { status: 500 })

  const res = await fetch(arama.kayitUrl, {
    headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}` },
  })
  if (!res.ok) return NextResponse.json({ error: 'Kayıt indirilemedi' }, { status: 502 })

  const blob = await res.arrayBuffer()
  return new NextResponse(blob, { headers: { 'Content-Type': 'audio/mpeg' } })
}
