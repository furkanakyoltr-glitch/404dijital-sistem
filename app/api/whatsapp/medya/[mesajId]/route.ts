import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

const WA_TOKEN = process.env.WA_TOKEN

// Panelden gelen görsel/PDF önizlemesi — Meta'nın medya URL'i kısa süre geçerli ve
// token ister, bu yüzden her istekte taze URL alıp içeriği proxy'liyoruz.
export async function GET(req: NextRequest, { params }: { params: { mesajId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }
  if (!WA_TOKEN) return NextResponse.json({ error: 'WA_TOKEN tanımlı değil' }, { status: 500 })

  const mesaj = await prisma.wPSohbetMesaj.findUnique({ where: { id: params.mesajId } })
  if (!mesaj?.waMedyaId) return NextResponse.json({ error: 'Medya bulunamadı' }, { status: 404 })

  try {
    const metaRes = await fetch(`https://graph.facebook.com/v19.0/${mesaj.waMedyaId}`, {
      headers: { Authorization: `Bearer ${WA_TOKEN}` },
    })
    const meta = await metaRes.json()
    if (!metaRes.ok || !meta.url) {
      return NextResponse.json({ error: 'Medya URL alınamadı' }, { status: 502 })
    }

    const dosyaRes = await fetch(meta.url, { headers: { Authorization: `Bearer ${WA_TOKEN}` } })
    if (!dosyaRes.ok) return NextResponse.json({ error: 'Medya indirilemedi' }, { status: 502 })

    const buffer = await dosyaRes.arrayBuffer()
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': meta.mime_type || 'application/octet-stream',
        'Cache-Control': 'private, max-age=300',
      },
    })
  } catch (err) {
    console.error('WA medya proxy hatası:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
