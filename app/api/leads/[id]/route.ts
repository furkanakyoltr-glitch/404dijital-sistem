import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { LEAD_DURUMLAR } from '@/lib/leads'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await req.json()
    const data: { durum?: string; takipNotu?: string } = {}

    if (body.durum !== undefined) {
      if (!LEAD_DURUMLAR.some(d => d.value === body.durum)) {
        return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 })
      }
      data.durum = body.durum
    }
    if (body.takipNotu !== undefined) data.takipNotu = body.takipNotu

    const lead = await prisma.lead.update({ where: { id: params.id }, data })
    return NextResponse.json({ success: true, lead })
  } catch (err: any) {
    console.error('Lead güncelleme hatası:', err)
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 })
  }
}
