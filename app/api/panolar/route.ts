import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function adminMi() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.type !== 'admin') return null
  return user
}

export async function GET(req: NextRequest) {
  const user = await adminMi()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const departmanFiltre = searchParams.get('departman')

  const where: any = {}
  if (user.departman === 'yonetim') {
    if (departmanFiltre) where.departman = departmanFiltre
  } else {
    where.departman = user.departman
  }

  const panolar = await prisma.pano.findMany({
    where,
    include: { _count: { select: { gorevler: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ data: panolar })
}

export async function POST(req: NextRequest) {
  const user = await adminMi()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await req.json()
    const { ad, departman } = body
    if (!ad?.trim()) return NextResponse.json({ error: 'Pano adı gerekli' }, { status: 400 })

    const hedefDepartman = user.departman === 'yonetim' && departman ? departman : user.departman

    const pano = await prisma.pano.create({
      data: { ad, departman: hedefDepartman, olusturanId: user.id },
    })
    return NextResponse.json({ data: pano }, { status: 201 })
  } catch (e) {
    console.error('Pano oluşturma hatası:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
