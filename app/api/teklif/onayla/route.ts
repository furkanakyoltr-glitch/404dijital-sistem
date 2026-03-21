import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendOnayMaili } from '@/lib/mail'
import { sendTeklifOnayBildirimi } from '@/lib/make-webhook'

export async function POST(req: NextRequest) {
  const { kasaNo } = await req.json()
  const musteri = await prisma.musteri.findUnique({ where: { kasaNo }, include: { teklifler: { where: { durum: { not: 'onaylandi' } }, take: 1 } } })
  if (!musteri) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  await prisma.musteri.update({ where: { kasaNo }, data: { durum: 'aktif' } })
  await prisma.teklif.updateMany({ where: { musteriId: musteri.id, durum: 'bekliyor' }, data: { durum: 'onaylandi', onayTarihi: new Date() } })
  await sendOnayMaili({ firmaAdi: musteri.firmaAdi, kasaNo, yetkiliEmail: musteri.email })
  await sendTeklifOnayBildirimi(musteri.firmaAdi, kasaNo)
  return NextResponse.json({ success: true })
}
