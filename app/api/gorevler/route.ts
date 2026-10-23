import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { otomasyonlariCalistir } from '@/lib/otomasyon'

async function adminMi() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.type !== 'admin') return null
  return user
}

async function panoyaErisimVarMi(user: any, panoId: string) {
  const pano = await prisma.pano.findUnique({ where: { id: panoId } })
  if (!pano) return null
  if (user.departman !== 'yonetim' && pano.departman !== user.departman) return null
  return pano
}

export async function GET(req: NextRequest) {
  const user = await adminMi()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const panoId = searchParams.get('panoId')
  if (!panoId) return NextResponse.json({ error: 'panoId gerekli' }, { status: 400 })

  const pano = await panoyaErisimVarMi(user, panoId)
  if (!pano) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

  const gorevler = await prisma.gorev.findMany({
    where: { panoId },
    include: {
      atanan: { select: { id: true, name: true } },
      olusturan: { select: { id: true, name: true } },
      musteri: { select: { id: true, firmaAdi: true } },
    },
    orderBy: [{ durum: 'asc' }, { sira: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json({ data: gorevler })
}

export async function POST(req: NextRequest) {
  const user = await adminMi()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await req.json()
    const { panoId, baslik, aciklama, oncelik, musteriId, atananId, sonTarih } = body
    if (!panoId || !baslik?.trim()) return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })

    const pano = await panoyaErisimVarMi(user, panoId)
    if (!pano) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

    const gorev = await prisma.gorev.create({
      data: {
        panoId, baslik,
        aciklama: aciklama || null,
        oncelik: oncelik || 'normal',
        musteriId: musteriId || null,
        atananId: atananId || null,
        olusturanId: user.id,
        sonTarih: sonTarih ? new Date(sonTarih) : null,
      },
      include: {
        atanan: { select: { id: true, name: true, telefon: true } },
        olusturan: { select: { id: true, name: true } },
        musteri: { select: { id: true, firmaAdi: true } },
      },
    })

    if (gorev.atananId && gorev.atanan) {
      otomasyonlariCalistir('gorev_atandi', {
        atananAdi: gorev.atanan.name,
        atananTelefon: gorev.atanan.telefon,
        gorevBaslik: gorev.baslik,
        panoAdi: pano.ad,
        departman: pano.departman,
      }).catch(() => {})
    }

    return NextResponse.json({ data: gorev }, { status: 201 })
  } catch (e) {
    console.error('Görev oluşturma hatası:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
