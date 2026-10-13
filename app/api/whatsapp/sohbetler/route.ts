import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const sohbetler = await prisma.wPSohbet.findMany({
      orderBy: { sonMesajZamani: 'desc' },
    })
    return NextResponse.json({ data: sohbetler })
  } catch (err) {
    console.error('WPSohbet sorgu hatası (migration henüz uygulanmamış olabilir):', err)
    return NextResponse.json({ data: [] })
  }
}
