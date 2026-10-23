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

async function gorevVeErisim(user: any, id: string) {
  const gorev = await prisma.gorev.findUnique({ where: { id }, include: { pano: true } })
  if (!gorev) return null
  if (user.departman !== 'yonetim' && gorev.pano.departman !== user.departman) return null
  return gorev
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await adminMi()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const gorev = await gorevVeErisim(user, params.id)
  if (!gorev) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

  try {
    const body = await req.json()
    const { baslik, aciklama, durum, oncelik, musteriId, atananId, sonTarih, sira } = body

    const data: any = {}
    if (baslik !== undefined) data.baslik = baslik
    if (aciklama !== undefined) data.aciklama = aciklama
    if (durum !== undefined) data.durum = durum
    if (oncelik !== undefined) data.oncelik = oncelik
    if (musteriId !== undefined) data.musteriId = musteriId || null
    if (atananId !== undefined) data.atananId = atananId || null
    if (sonTarih !== undefined) data.sonTarih = sonTarih ? new Date(sonTarih) : null
    if (sira !== undefined) data.sira = sira

    const oncekiAtananId = gorev.atananId
    const oncekiDurum = gorev.durum

    const guncel = await prisma.gorev.update({
      where: { id: params.id },
      data,
      include: {
        atanan: { select: { id: true, name: true, telefon: true } },
        olusturan: { select: { id: true, name: true } },
        musteri: { select: { id: true, firmaAdi: true } },
      },
    })

    const yeniAtamaOldu = atananId !== undefined && atananId && atananId !== oncekiAtananId
    const tamamlandiOldu = durum === 'tamamlandi' && oncekiDurum !== 'tamamlandi'

    if (yeniAtamaOldu && guncel.atanan) {
      otomasyonlariCalistir('gorev_atandi', {
        atananAdi: guncel.atanan.name,
        atananTelefon: guncel.atanan.telefon,
        gorevBaslik: guncel.baslik,
        panoAdi: gorev.pano.ad,
        departman: gorev.pano.departman,
      }).catch(() => {})
    }
    if (tamamlandiOldu && guncel.atanan) {
      otomasyonlariCalistir('gorev_tamamlandi', {
        atananAdi: guncel.atanan.name,
        atananTelefon: guncel.atanan.telefon,
        gorevBaslik: guncel.baslik,
        panoAdi: gorev.pano.ad,
        departman: gorev.pano.departman,
      }).catch(() => {})
    }

    return NextResponse.json({ data: guncel })
  } catch (e) {
    console.error('Görev güncelleme hatası:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await adminMi()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const gorev = await gorevVeErisim(user, params.id)
  if (!gorev) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

  await prisma.gorev.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
