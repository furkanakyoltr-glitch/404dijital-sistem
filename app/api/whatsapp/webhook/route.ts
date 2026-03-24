import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { parseWPMesaj } from '@/lib/whatsapp/parser'

const FURKAN_NO = '+905446844067'

async function makeWebhook(payload: object) {
  const url = process.env.MAKE_TEKLIF_WEBHOOK_URL
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.error('Make webhook hatası:', e)
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret')
  if (secret !== process.env.WP_WEBHOOK_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { mesaj, telNo } = body
  if (!mesaj) return NextResponse.json({ error: 'Mesaj yok' }, { status: 400 })

  const mesajLower = mesaj.toLowerCase().trim()

  // ── TEKLİF ONAY AKIŞI ──────────────────────────────────────────────
  // "onaylıyorum" içeriyorsa → kasaNo bul → teklifi onayla → Furkan'a bildir
  if (mesajLower.includes('onaylıyorum') || mesajLower.includes('onayliyorum') || mesajLower.includes('onayla')) {
    // Mesajdaki kasaNo'yu bul (404-XXXX formatı)
    const kasaMatch = mesaj.match(/404-\d{3,6}/i)
    const kasaNo = kasaMatch?.[0]

    if (kasaNo) {
      const teklif = await prisma.teklif.findFirst({ where: { teklifNo: kasaNo }, include: { musteri: true } })
      if (teklif && teklif.durum !== 'onaylandi') {
        await prisma.teklif.update({ where: { id: teklif.id }, data: { durum: 'onaylandi', onayTarihi: new Date() } })
        // Furkan'a bildir
        await makeWebhook({
          action: 'teklif_onaylandi',
          telefon: FURKAN_NO,
          mesaj: `✅ ${teklif.musteri?.firmaAdi || kasaNo} firması teklifini ONAYLADI!\nKasa: ${kasaNo}\nTutar: ₺${teklif.toplam?.toLocaleString('tr-TR')}`,
          kasaNo,
          firmaAdi: teklif.musteri?.firmaAdi,
          toplam: teklif.toplam,
        })
        return NextResponse.json({ received: true, action: 'teklif_onaylandi', kasaNo })
      }
    }
  }

  // "onaylamıyorum" veya "reddediyorum" → Furkan'a bildir
  if (mesajLower.includes('onaylamıyorum') || mesajLower.includes('reddediyorum') || mesajLower.includes('istemiyorum')) {
    const kasaMatch = mesaj.match(/404-\d{3,6}/i)
    const kasaNo = kasaMatch?.[0]
    if (kasaNo) {
      const teklif = await prisma.teklif.findFirst({ where: { teklifNo: kasaNo }, include: { musteri: true } })
      if (teklif) {
        await prisma.teklif.update({ where: { id: teklif.id }, data: { durum: 'reddedildi', redTarihi: new Date() } })
        await makeWebhook({
          action: 'teklif_reddedildi',
          telefon: FURKAN_NO,
          mesaj: `❌ ${teklif.musteri?.firmaAdi || kasaNo} firması teklifi REDDETTİ.\nKasa: ${kasaNo}`,
          kasaNo,
          firmaAdi: teklif.musteri?.firmaAdi,
        })
        return NextResponse.json({ received: true, action: 'teklif_reddedildi', kasaNo })
      }
    }
  }
  // ────────────────────────────────────────────────────────────────────

  const parsed = parseWPMesaj(mesaj)
  if (!parsed) return NextResponse.json({ received: true, parsed: false })

  const wpMesaj = await prisma.wPMesaj.create({
    data: {
      mesaj, telNo: telNo || '',
      islemTipi: parsed.islemTipi, tutar: parsed.tutar,
      kategori: parsed.kategori, aciklama: parsed.aciklama,
      durum: 'islendi',
    }
  })

  const now = new Date()

  if (parsed.islemTipi === 'GELIR') {
    const gelir = await prisma.gelir.create({
      data: {
        gelirTuru: 'Tahsilat', tutar: parsed.tutar, kdvOrani: 0, kdvDahil: false,
        netTutar: parsed.tutar, tarih: now, aciklama: parsed.aciklama,
        tahsilatDurumu: 'Tahsil Edildi', onayDurumu: 'onaylandi',
        wpMesajId: wpMesaj.id, musteriAdi: 'WhatsApp',
      }
    })
    return NextResponse.json({ received: true, parsed: true, tip: 'GELIR', gelirId: gelir.id })
  }

  if (parsed.islemTipi === 'GIDER') {
    const gider = await prisma.gider.create({
      data: {
        kategori: parsed.kategori, tutar: parsed.tutar, kdvOrani: 0, kdvDahil: false,
        netTutar: parsed.tutar, tarih: now, aciklama: parsed.aciklama,
        odemeDurumu: 'Ödendi', onayDurumu: 'onaylandi',
        wpMesajId: wpMesaj.id,
      }
    })
    return NextResponse.json({ received: true, parsed: true, tip: 'GIDER', giderId: gider.id })
  }

  return NextResponse.json({ received: true, parsed: true, id: wpMesaj.id })
}
