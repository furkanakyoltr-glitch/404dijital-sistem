import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { uploadSosyalMedya } from '@/lib/supabase/storage'

const MAX_BOYUT = 200 * 1024 * 1024 // Reels videoları için

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const hesapId = req.nextUrl.searchParams.get('hesapId')
  const gonderiler = await prisma.sosyalMedyaGonderi.findMany({
    where: hesapId ? { hesapId } : undefined,
    include: { hesap: { select: { adlandirma: true } } },
    orderBy: { planlananTarih: 'asc' },
  })
  return NextResponse.json({ gonderiler })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const form = await req.formData()
    const hesapId = form.get('hesapId') as string | null
    const platform = form.get('platform') as string | null
    const tip = form.get('tip') as string | null
    const aciklama = (form.get('aciklama') as string | null) || ''
    const planlananTarih = form.get('planlananTarih') as string | null
    const dosya = form.get('dosya') as File | null

    if (!hesapId || !platform || !tip || !planlananTarih || !dosya) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 })
    }
    if (dosya.size > MAX_BOYUT) return NextResponse.json({ error: 'Dosya 200MB üzeri olamaz' }, { status: 400 })

    const hesap = await prisma.sosyalMedyaHesap.findUnique({ where: { id: hesapId } })
    if (!hesap) return NextResponse.json({ error: 'Hesap bulunamadı' }, { status: 404 })
    if (platform === 'instagram' && tip === 'reels' && !hesap.igHesapId) {
      return NextResponse.json({ error: 'Bu hesabın bağlı Instagram Business hesabı yok' }, { status: 400 })
    }

    const gonderiId = crypto.randomUUID()
    const medyaUrl = await uploadSosyalMedya(dosya, gonderiId)

    const gonderi = await prisma.sosyalMedyaGonderi.create({
      data: {
        id: gonderiId,
        hesapId,
        platform,
        tip,
        medyaUrl,
        aciklama,
        planlananTarih: new Date(planlananTarih),
        olusturanAdminId: (session.user as any).id || null,
      },
    })
    return NextResponse.json({ success: true, gonderi })
  } catch (err: any) {
    console.error('Sosyal medya gönderi oluşturma hatası:', err)
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 })
  }
}
