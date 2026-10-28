import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sayfaBilgisiGetir } from '@/lib/meta-sosyal'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const hesaplar = await prisma.sosyalMedyaHesap.findMany({
    include: { musteri: { select: { firmaAdi: true } }, _count: { select: { gonderiler: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({
    hesaplar: hesaplar.map(h => ({ ...h, erisimTokeni: undefined, tokenVar: true })),
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const { adlandirma, sayfaId, erisimTokeni, musteriId } = await req.json()
    if (!adlandirma?.trim() || !sayfaId?.trim() || !erisimTokeni?.trim()) {
      return NextResponse.json({ error: 'Adlandırma, sayfa ID ve erişim token zorunlu' }, { status: 400 })
    }

    const dogrulama = await sayfaBilgisiGetir(sayfaId.trim(), erisimTokeni.trim())
    if (!dogrulama.ok) {
      return NextResponse.json({ error: `Sayfa doğrulanamadı: ${dogrulama.hata}` }, { status: 400 })
    }

    const hesap = await prisma.sosyalMedyaHesap.create({
      data: {
        adlandirma: adlandirma.trim(),
        sayfaId: sayfaId.trim(),
        erisimTokeni: erisimTokeni.trim(),
        igHesapId: dogrulama.igHesapId || null,
        musteriId: musteriId || null,
      },
    })
    return NextResponse.json({ success: true, hesap: { ...hesap, erisimTokeni: undefined }, sayfaAdi: dogrulama.adi })
  } catch (err: any) {
    console.error('Sosyal medya hesabı ekleme hatası:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
