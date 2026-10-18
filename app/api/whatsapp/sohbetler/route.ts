import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const internalKey = req.headers.get('x-internal-key')
  const isInternal = internalKey && internalKey === process.env.INTERNAL_API_KEY
  if (!isInternal) {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  try {
    const sohbetler = await prisma.wPSohbet.findMany({
      orderBy: { sonMesajZamani: 'desc' },
      include: isInternal ? { mesajlar: { orderBy: { createdAt: 'desc' }, take: 5 } } : undefined,
    })
    return NextResponse.json({ data: sohbetler })
  } catch (err) {
    console.error('WPSohbet sorgu hatası (migration henüz uygulanmamış olabilir):', err)
    return NextResponse.json({ data: [] })
  }
}
