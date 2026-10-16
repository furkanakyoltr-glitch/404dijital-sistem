import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { metaSablonDurumGetir } from '@/lib/whatsapp'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const sablon = await prisma.wASablon.findUnique({ where: { id: params.id } })
  if (!sablon) return NextResponse.json({ error: 'Şablon bulunamadı' }, { status: 404 })
  if (!sablon.metaTemplateId) return NextResponse.json({ error: 'Bu şablon Meta üzerinden oluşturulmamış' }, { status: 400 })

  const sonuc = await metaSablonDurumGetir(sablon.metaTemplateId)
  if (!sonuc.ok) return NextResponse.json({ error: sonuc.hata || 'Durum alınamadı' }, { status: 502 })

  const guncel = await prisma.wASablon.update({ where: { id: params.id }, data: { metaDurum: sonuc.durum || sablon.metaDurum } })
  return NextResponse.json({ success: true, metaDurum: guncel.metaDurum })
}
