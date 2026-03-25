import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  const session = await getServerSession(authOptions)
  const userType = (session?.user as any)?.type
  const userKasaNo = (session?.user as any)?.kasaNo

  // Admin veya kendi kasasını açan müşteri erişebilir
  if (!session || (userType !== 'admin' && userKasaNo !== id)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

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
