import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendTeklifWP, sendFurkanBildirim } from '@/lib/whatsapp'

// Railway cron veya harici bir cron servisi tarafından çağrılır
// Örnek: her 2 dakikada bir GET /api/cron/teklif-hatirlatici?secret=...

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.WP_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const besMinuteAgo = new Date(Date.now() - 5 * 60 * 1000)
  const onMinuteAgo = new Date(Date.now() - 10 * 60 * 1000)

  // WP gönderilmiş, 5+ dk geçmiş, bekliyor durumunda, hatırlatıcı henüz gönderilmemiş
  const bekleyenTeklifler = await prisma.teklif.findMany({
    where: {
      wpGonderimZamani: { lte: besMinuteAgo, gte: onMinuteAgo },
      hatirlaticiGonderildi: false,
      durum: 'bekliyor',
    },
    include: { musteri: true },
  })

  let gonderilen = 0
  for (const teklif of bekleyenTeklifler) {
    const musteri = teklif.musteri
    if (!musteri) continue

    // Müşteriye hatırlatıcı gönder
    const hatirlatmaMetni =
      `Merhaba ${musteri.yetkiliKisi} Bey/Hanım,\n\n` +
      `404 Dijital teklifimizi inceleme fırsatı buldunuz mu? 😊\n\n` +
      `Teklifinize ulaşmak için: https://teklif.404dijital.com/${teklif.teklifNo}\n` +
      `Kasa No: *${teklif.teklifNo}*\n\n` +
      `Onaylamak için "Onaylıyorum ${teklif.teklifNo}" yazabilirsiniz.\n` +
      `Sorularınız için: *+90 544 684 40 67*`

    await sendTeklifWP({
      telefon: musteri.telefon,
      yetkiliKisi: musteri.yetkiliKisi,
      firmaAdi: musteri.firmaAdi,
      kasaNo: teklif.teklifNo,
      paketAdi: teklif.paketAdi,
      toplam: teklif.toplam,
    })

    // Furkan'a beklemede bildirimi
    await sendFurkanBildirim(
      `⏳ Teklif Beklemede\n${musteri.firmaAdi} (${teklif.teklifNo}) henüz onay vermedi.\nTutar: ₺${teklif.toplam.toLocaleString('tr-TR')}\nTelefon: ${musteri.telefon}`
    )

    await prisma.teklif.update({
      where: { id: teklif.id },
      data: { hatirlaticiGonderildi: true },
    })
    gonderilen++
  }

  return NextResponse.json({ ok: true, gonderilen })
}
