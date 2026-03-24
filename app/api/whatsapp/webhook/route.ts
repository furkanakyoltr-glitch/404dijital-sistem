import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { parseWPMesaj } from '@/lib/whatsapp/parser'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret')
  if (secret !== process.env.WP_WEBHOOK_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { mesaj, telNo } = body
  if (!mesaj) return NextResponse.json({ error: 'Mesaj yok' }, { status: 400 })

  const parsed = parseWPMesaj(mesaj)
  if (!parsed) return NextResponse.json({ received: true, parsed: false })

  // WPMesaj kaydı oluştur
  const wpMesaj = await prisma.wPMesaj.create({
    data: {
      mesaj,
      telNo: telNo || '',
      islemTipi: parsed.islemTipi,
      tutar: parsed.tutar,
      kategori: parsed.kategori,
      aciklama: parsed.aciklama,
      durum: 'islendi',
    }
  })

  const now = new Date()

  // GELİR ise → direkt Gelir kaydı oluştur (onay beklemeden)
  if (parsed.islemTipi === 'GELIR') {
    const gelir = await prisma.gelir.create({
      data: {
        gelirTuru: 'Tahsilat',
        tutar: parsed.tutar,
        kdvOrani: 0,
        kdvDahil: false,
        netTutar: parsed.tutar,
        tarih: now,
        aciklama: parsed.aciklama,
        tahsilatDurumu: 'Tahsil Edildi',
        onayDurumu: 'onaylandi',
        wpMesajId: wpMesaj.id,
        musteriAdi: 'WhatsApp',
      }
    })
    return NextResponse.json({ received: true, parsed: true, tip: 'GELIR', gelirId: gelir.id, tutar: parsed.tutar, aciklama: parsed.aciklama })
  }

  // GİDER ise → direkt Gider kaydı oluştur
  if (parsed.islemTipi === 'GIDER') {
    const gider = await prisma.gider.create({
      data: {
        kategori: parsed.kategori,
        tutar: parsed.tutar,
        kdvOrani: 0,
        kdvDahil: false,
        netTutar: parsed.tutar,
        tarih: now,
        aciklama: parsed.aciklama,
        odemeDurumu: 'Ödendi',
        onayDurumu: 'onaylandi',
        wpMesajId: wpMesaj.id,
      }
    })
    return NextResponse.json({ received: true, parsed: true, tip: 'GIDER', giderId: gider.id, tutar: parsed.tutar, aciklama: parsed.aciklama })
  }

  return NextResponse.json({ received: true, parsed: true, id: wpMesaj.id })
}
