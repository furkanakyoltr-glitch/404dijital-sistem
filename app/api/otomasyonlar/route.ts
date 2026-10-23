import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function yonetimMi() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.type !== 'admin' || user.departman !== 'yonetim') return null
  return user
}

export async function GET() {
  const user = await yonetimMi()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const otomasyonlar = await prisma.otomasyon.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ data: otomasyonlar })
}

export async function POST(req: NextRequest) {
  const user = await yonetimMi()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await req.json()
    const { ad, tetikleyici, departman, mesaj } = body
    if (!ad?.trim() || !tetikleyici?.trim() || !mesaj?.trim()) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })
    }

    const otomasyon = await prisma.otomasyon.create({
      data: { ad, tetikleyici, departman: departman || 'tumu', mesaj, olusturanId: user.id },
    })
    return NextResponse.json({ data: otomasyon }, { status: 201 })
  } catch (e) {
    console.error('Otomasyon oluşturma hatası:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
