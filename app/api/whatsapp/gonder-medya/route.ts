import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendWAFile } from '@/lib/whatsapp'

const MAX_BOYUT = 15 * 1024 * 1024 // WhatsApp belge limiti ~100MB ama panelde 15MB'a sınırlıyoruz

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const form = await req.formData()
    const sohbetId = form.get('sohbetId') as string | null
    const caption = (form.get('caption') as string | null)?.trim() || undefined
    const dosya = form.get('dosya') as File | null

    if (!sohbetId || !dosya) return NextResponse.json({ error: 'Eksik veri' }, { status: 400 })
    if (dosya.size > MAX_BOYUT) return NextResponse.json({ error: 'Dosya 15MB üzeri olamaz' }, { status: 400 })

    const sohbet = await prisma.wPSohbet.findUnique({ where: { id: sohbetId } })
    if (!sohbet) return NextResponse.json({ error: 'Sohbet bulunamadı' }, { status: 404 })

    const buffer = Buffer.from(await dosya.arrayBuffer())
    const sonuc = await sendWAFile(sohbet.telNo, buffer, dosya.type || 'application/octet-stream', dosya.name, caption)

    if (!sonuc.ok) {
      return NextResponse.json({ error: sonuc.hata || 'Gönderilemedi (24 saatlik müşteri hizmeti penceresi kapanmış olabilir)' }, { status: 502 })
    }

    const mesaj = await prisma.wPSohbetMesaj.create({
      data: {
        sohbetId,
        yon: 'giden',
        icerik: caption || '',
        medyaTipi: sonuc.tip,
        medyaAdi: dosya.name,
        gonderenAdminId: (session.user as any).id || null,
        waMesajId: sonuc.waMesajId,
      },
    })
    await prisma.wPSohbet.update({
      where: { id: sohbetId },
      data: { sonMesaj: sonuc.tip === 'image' ? '📷 Görsel' : `📎 ${dosya.name}`, sonMesajZamani: new Date() },
    })

    return NextResponse.json({ success: true, mesaj })
  } catch (err: any) {
    console.error('WA medya gönderim hatası:', err)
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 })
  }
}
