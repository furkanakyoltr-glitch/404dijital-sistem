import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await req.json()
    const icerik = (body.icerik || '').trim()
    if (!icerik) return NextResponse.json({ error: 'Not boş olamaz' }, { status: 400 })

    const not = await prisma.leadNot.create({
      data: {
        leadId: params.id,
        icerik,
        olusturanId: (session.user as any).id || null,
      },
      include: { olusturan: { select: { name: true } } },
    })

    return NextResponse.json({ success: true, not })
  } catch (err: any) {
    console.error('Lead notu ekleme hatası:', err)
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 })
  }
}
