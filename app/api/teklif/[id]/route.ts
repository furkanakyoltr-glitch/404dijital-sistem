import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const musteri = await prisma.musteri.findUnique({
    where: { kasaNo: id },
    include: { teklifler: { orderBy: { createdAt: 'desc' }, take: 1 } }
  })
  if (!musteri || !musteri.teklifler[0]) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  const t = musteri.teklifler[0]
  return NextResponse.json({
    id: t.id, teklifNo: t.teklifNo, firmaAdi: musteri.firmaAdi, yetkiliKisi: musteri.yetkiliKisi,
    paketAdi: t.paketAdi, paketKategori: t.paketKategori, paketDetay: t.paketDetay, stratejiNotu: t.stratejiNotu,
    islerListesi: t.islerListesi, ekGiderler: t.ekGiderler,
    fiyat: t.fiyat, indirim: t.indirim, kdvOrani: t.kdvOrani, toplam: t.toplam,
    durum: t.durum, gecerlilikTarihi: t.gecerlilikTarihi, createdAt: t.createdAt,
  })
}
