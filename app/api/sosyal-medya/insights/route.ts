import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { igProfilGetir, igHesapInsightsGetir, igSonMedyalarGetir } from '@/lib/meta-sosyal'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const hesapId = req.nextUrl.searchParams.get('hesapId')
  if (!hesapId) return NextResponse.json({ error: 'hesapId zorunlu' }, { status: 400 })

  const hesap = await prisma.sosyalMedyaHesap.findUnique({ where: { id: hesapId } })
  if (!hesap) return NextResponse.json({ error: 'Hesap bulunamadı' }, { status: 404 })
  if (!hesap.igHesapId) return NextResponse.json({ error: 'Bu hesabın bağlı Instagram Business hesabı yok' }, { status: 400 })

  const [profil, insights, medyalar] = await Promise.all([
    igProfilGetir(hesap.igHesapId, hesap.erisimTokeni),
    igHesapInsightsGetir(hesap.igHesapId, hesap.erisimTokeni),
    igSonMedyalarGetir(hesap.igHesapId, hesap.erisimTokeni),
  ])

  if (!profil.ok) return NextResponse.json({ error: profil.hata || 'Profil alınamadı' }, { status: 502 })

  return NextResponse.json({
    profil: profil.profil,
    insights: insights.ok ? insights.insights : null,
    insightsHata: insights.ok ? null : insights.hata,
    medyalar: medyalar.ok ? medyalar.medyalar : [],
  })
}
