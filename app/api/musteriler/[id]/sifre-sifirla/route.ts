import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generatePassword } from '@/lib/utils'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const yeniSifre = generatePassword()
    const hashedSifre = await bcrypt.hash(yeniSifre, 10)
    const musteri = await prisma.musteri.update({
      where: { id: params.id },
      data: { sifre: hashedSifre },
      select: { kasaNo: true },
    })
    return NextResponse.json({ success: true, kasaNo: musteri.kasaNo, sifre: yeniSifre })
  } catch (err: any) {
    console.error('Şifre sıfırlama hatası:', err)
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 })
  }
}
