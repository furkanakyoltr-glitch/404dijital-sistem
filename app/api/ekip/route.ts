import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function yonetimMi() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.type !== 'admin') return null
  if (user.departman !== 'yonetim') return null
  return user
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  // Yönetim tam detay görür (e-posta dahil), diğer departmanlar sadece atama için isim listesi görür
  const tamYetki = user.departman === 'yonetim'
  const ekip = await prisma.admin.findMany({
    select: tamYetki
      ? { id: true, name: true, email: true, departman: true, role: true, telefon: true, createdAt: true }
      : { id: true, name: true, departman: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ data: ekip })
}

export async function POST(req: NextRequest) {
  const user = await yonetimMi()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, email, password, departman, role, telefon } = body

    if (!name?.trim() || !email?.trim() || !password?.trim() || !departman?.trim()) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })
    }

    const mevcut = await prisma.admin.findUnique({ where: { email } })
    if (mevcut) return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı' }, { status: 409 })

    const hashedPassword = await bcrypt.hash(password, 10)

    const yeniAdmin = await prisma.admin.create({
      data: {
        name, email, password: hashedPassword,
        departman, role: role === 'yonetim' ? 'admin' : (role || 'uye'),
        telefon: telefon || null,
      },
      select: { id: true, name: true, email: true, departman: true, role: true, telefon: true, createdAt: true },
    })

    return NextResponse.json({ data: { ...yeniAdmin, geciciSifre: password } }, { status: 201 })
  } catch (e) {
    console.error('Ekip ekleme hatası:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
