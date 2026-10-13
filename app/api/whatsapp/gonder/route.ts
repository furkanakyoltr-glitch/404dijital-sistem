import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendWAText } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const { sohbetId, icerik } = await req.json()
    if (!sohbetId || !icerik?.trim()) return NextResponse.json({ error: 'Eksik veri' }, { status: 400 })

    const sohbet = await prisma.wPSohbet.findUnique({ where: { id: sohbetId } })
    if (!sohbet) return NextResponse.json({ error: 'Sohbet bulunamadı' }, { status: 404 })

    const sonuc = await sendWAText(sohbet.telNo, icerik)
    if (!sonuc.ok) {
      return NextResponse.json({ error: sonuc.hata || 'Gönderilemedi (24 saatlik müşteri hizmeti penceresi kapanmış olabilir)' }, { status: 502 })
    }

    const mesaj = await prisma.wPSohbetMesaj.create({
      data: {
        sohbetId,
        yon: 'giden',
        icerik,
        gonderenAdminId: (session.user as any).id || null,
        waMesajId: sonuc.waMesajId,
      },
    })
    await prisma.wPSohbet.update({
      where: { id: sohbetId },
      data: { sonMesaj: icerik, sonMesajZamani: new Date() },
    })

    return NextResponse.json({ success: true, mesaj })
  } catch (err: any) {
    console.error('WA gönderim hatası:', err)
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 })
  }
}
