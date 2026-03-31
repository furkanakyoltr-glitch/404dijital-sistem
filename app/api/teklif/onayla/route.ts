import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendOnayAdminBildirim } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  const { kasaNo } = await req.json()
  const musteri = await prisma.musteri.findUnique({ where: { kasaNo } })
  if (!musteri) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  await prisma.musteri.update({ where: { kasaNo }, data: { durum: 'aktif' } })
  await prisma.teklif.updateMany({ where: { musteriId: musteri.id, durum: 'bekliyor' }, data: { durum: 'onaylandi', onayTarihi: new Date() } })
  sendOnayAdminBildirim(musteri.firmaAdi, kasaNo).catch(() => {})
  return NextResponse.json({ success: true })
}
