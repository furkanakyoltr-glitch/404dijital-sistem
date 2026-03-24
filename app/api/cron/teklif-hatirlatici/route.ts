import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendFurkanBildirim } from '@/lib/whatsapp'

const WA_TOKEN = process.env.WA_TOKEN
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID

async function sendWAMessage(to: string, text: string) {
  if (!WA_TOKEN || !WA_PHONE_NUMBER_ID) return
  const phone = to.replace(/\s+/g, '').replace(/^0/, '90').replace(/^\+/, '')
  await fetch(`https://graph.facebook.com/v19.0/${WA_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WA_TOKEN}` },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: text } }),
  })
}

// Railway cron veya harici bir cron servisi tarafından çağrılır
// Örnek: her 2 dakikada bir GET /api/cron/teklif-hatirlatici?secret=...

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.WP_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const besMinuteAgo = new Date(Date.now() - 5 * 60 * 1000)

  // WP gönderilmiş, 5+ dk geçmiş, bekliyor durumunda, hatırlatıcı henüz gönderilmemiş
  const bekleyenTeklifler = await prisma.teklif.findMany({
    where: {
      wpGonderimZamani: { lte: besMinuteAgo },
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

    await sendWAMessage(musteri.telefon, hatirlatmaMetni)

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
