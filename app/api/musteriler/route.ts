import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generatePassword } from '@/lib/utils'

async function generateUniqueKasaNo(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const num = Math.floor(Math.random() * 8900) + 1000
    const kasaNo = `404-${num}`
    const existing = await prisma.musteri.findUnique({ where: { kasaNo } })
    if (!existing) return kasaNo
  }
  return `404-${Date.now().toString().slice(-6)}`
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const page = parseInt(searchParams.get('page') || '1')
  const durum = searchParams.get('durum')
  const arama = searchParams.get('arama')

  const where: any = {}
  if (durum) where.durum = durum
  if (arama) where.OR = [
    { firmaAdi: { contains: arama, mode: 'insensitive' } },
    { kasaNo: { contains: arama, mode: 'insensitive' } },
    { email: { contains: arama, mode: 'insensitive' } },
  ]

  const [data, total] = await Promise.all([
    prisma.musteri.findMany({ where, take: limit, skip: (page - 1) * limit, orderBy: { createdAt: 'desc' }, include: { teklifler: { take: 1, orderBy: { createdAt: 'desc' } } } }),
    prisma.musteri.count({ where }),
  ])

  return NextResponse.json({ data, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await req.json()
    const { firmaAdi, yetkiliKisi, yetkiliUnvan, telefon, email, adres, vergiDairesi, vergiNo, notlar, durum } = body

    const kasaNo = await generateUniqueKasaNo()
    const sifre = generatePassword()
    const hashedSifre = await bcrypt.hash(sifre, 10)

    const musteri = await prisma.musteri.create({
      data: {
        firmaAdi, yetkiliKisi, yetkiliUnvan: yetkiliUnvan || null,
        telefon, email, adres: adres || null,
        vergiDairesi: vergiDairesi || null, vergiNo: vergiNo || null, notlar: notlar || null,
        kasaNo, sifre: hashedSifre,
        durum: durum || 'odeme_alinacak',
      }
    })

    return NextResponse.json({ success: true, kasaNo, sifre, musteriId: musteri.id })
  } catch (err: any) {
    console.error('Müşteri oluşturma hatası:', err)
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 })
  }
}
