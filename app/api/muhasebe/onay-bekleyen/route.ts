import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const mesajlar = await prisma.wPMesaj.findMany({ where: { durum: 'bekliyor' }, orderBy: { tarih: 'desc' } })
  return NextResponse.json(mesajlar)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { id, action } = await req.json()
  const mesaj = await prisma.wPMesaj.findUnique({ where: { id } })
  if (!mesaj) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  if (action === 'onayla' && mesaj.tutar) {
    const tarih = new Date()
    if (mesaj.islemTipi === 'GIDER') {
      const gider = await prisma.gider.create({
        data: { kategori: mesaj.kategori || 'Diğer', tutar: mesaj.tutar, kdvDahil: false, netTutar: mesaj.tutar, tarih, aciklama: mesaj.aciklama, odemeDurumu: 'Ödendi', wpMesajId: id, onayDurumu: 'onaylandi' }
      })
      await prisma.wPMesaj.update({ where: { id }, data: { durum: 'onaylandi', ilgiliGiderId: gider.id } })
    } else {
      const gelir = await prisma.gelir.create({
        data: { gelirTuru: 'Diğer', tutar: mesaj.tutar, kdvOrani: 0, kdvDahil: false, netTutar: mesaj.tutar, tarih, aciklama: mesaj.aciklama, tahsilatDurumu: 'Tahsil Edildi', wpMesajId: id, onayDurumu: 'onaylandi' }
      })
      await prisma.wPMesaj.update({ where: { id }, data: { durum: 'onaylandi', ilgiliGelirId: gelir.id } })
    }
  } else {
    await prisma.wPMesaj.update({ where: { id }, data: { durum: 'red' } })
  }
  return NextResponse.json({ success: true })
}
