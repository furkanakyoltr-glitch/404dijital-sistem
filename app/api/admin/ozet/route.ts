import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

const GUNLER = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
const AYLAR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Son 7 gün için başlangıç
  const yediGunOnce = new Date(now)
  yediGunOnce.setDate(yediGunOnce.getDate() - 6)
  yediGunOnce.setHours(0, 0, 0, 0)

  // Son 6 ay için başlangıç
  const altiAyOnce = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [toplamMusteri, aktifMusteri, bekleyenTeklif, buAyGelir, haftalikGelirRaw, aylikGelirRaw, aylikGiderRaw] = await Promise.all([
    prisma.musteri.count(),
    prisma.musteri.count({ where: { durum: 'aktif' } }),
    prisma.teklif.count({ where: { durum: 'bekliyor' } }),
    prisma.gelir.aggregate({ where: { tarih: { gte: startOfMonth }, onayDurumu: 'onaylandi' }, _sum: { netTutar: true } }),
    prisma.gelir.findMany({ where: { tarih: { gte: yediGunOnce }, onayDurumu: 'onaylandi' }, select: { tarih: true, netTutar: true } }),
    prisma.gelir.findMany({ where: { tarih: { gte: altiAyOnce }, onayDurumu: 'onaylandi' }, select: { tarih: true, netTutar: true } }),
    prisma.gider.findMany({ where: { tarih: { gte: altiAyOnce }, onayDurumu: 'onaylandi' }, select: { tarih: true, netTutar: true } }),
  ])

  // Son 7 günü gün bazında grupla
  const haftalikMap: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    haftalikMap[key] = 0
  }
  haftalikGelirRaw.forEach(g => {
    const key = new Date(g.tarih).toISOString().split('T')[0]
    if (haftalikMap[key] !== undefined) haftalikMap[key] += g.netTutar
  })
  const haftalikVeri = Object.entries(haftalikMap).map(([tarih, deger]) => ({
    gun: GUNLER[new Date(tarih).getDay()],
    deger,
  }))

  // Son 6 ayı ay bazında grupla
  const aylikGelirMap: Record<string, number> = {}
  const aylikGiderMap: Record<string, number> = {}
  for (let i = 5; i >= 0; i--) {
    const key = `${now.getFullYear()}-${String(now.getMonth() - i + 1).padStart(2, '0')}`
    aylikGelirMap[key] = 0
    aylikGiderMap[key] = 0
  }
  aylikGelirRaw.forEach(g => {
    const d = new Date(g.tarih)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (aylikGelirMap[key] !== undefined) aylikGelirMap[key] += g.netTutar
  })
  aylikGiderRaw.forEach(g => {
    const d = new Date(g.tarih)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (aylikGiderMap[key] !== undefined) aylikGiderMap[key] += g.netTutar
  })
  const aylikVeri = Object.keys(aylikGelirMap).map(key => ({
    ay: AYLAR[parseInt(key.split('-')[1]) - 1],
    gelir: aylikGelirMap[key],
    gider: aylikGiderMap[key] || 0,
  }))

  return NextResponse.json({
    toplamMusteri, aktifMusteri, bekleyenTeklif,
    buAyGelir: buAyGelir._sum.netTutar || 0,
    ortalamaROI: 850,
    tamamlanmaOrani: 78,
    haftalikVeri,
    aylikVeri,
  })
}
