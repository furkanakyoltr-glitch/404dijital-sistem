import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { instagramReelsYayinla, instagramFotoYayinla, facebookPaylas } from '@/lib/meta-sosyal'

// Harici cron servisi tarafından periyodik çağrılır (teklif-hatirlatici-cron ile aynı mantık).
// Örnek: her 5 dakikada bir GET /api/cron/sosyal-medya-paylas?secret=...
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.WP_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const zamaniGelenler = await prisma.sosyalMedyaGonderi.findMany({
    where: { durum: 'bekliyor', planlananTarih: { lte: new Date() } },
    include: { hesap: true },
  })

  let yayinlanan = 0
  let hatali = 0

  for (const gonderi of zamaniGelenler) {
    const { hesap } = gonderi
    if (!hesap.aktif) {
      await prisma.sosyalMedyaGonderi.update({
        where: { id: gonderi.id },
        data: { durum: 'hata', hataMesaji: 'Hesap pasif durumda' },
      })
      hatali++
      continue
    }

    let sonuc: { ok: boolean; postId?: string; hata?: string }

    if (gonderi.platform === 'instagram') {
      if (!hesap.igHesapId) {
        sonuc = { ok: false, hata: 'Hesabın bağlı Instagram Business ID yok' }
      } else if (gonderi.tip === 'reels') {
        sonuc = await instagramReelsYayinla(hesap.igHesapId, hesap.erisimTokeni, gonderi.medyaUrl, gonderi.aciklama)
      } else {
        sonuc = await instagramFotoYayinla(hesap.igHesapId, hesap.erisimTokeni, gonderi.medyaUrl, gonderi.aciklama)
      }
    } else {
      sonuc = await facebookPaylas(hesap.sayfaId, hesap.erisimTokeni, gonderi.aciklama, gonderi.medyaUrl)
    }

    if (sonuc.ok) {
      await prisma.sosyalMedyaGonderi.update({
        where: { id: gonderi.id },
        data: { durum: 'yayinlandi', metaPostId: sonuc.postId, yayinlananTarih: new Date() },
      })
      yayinlanan++
    } else {
      await prisma.sosyalMedyaGonderi.update({
        where: { id: gonderi.id },
        data: { durum: 'hata', hataMesaji: sonuc.hata || 'Bilinmeyen hata' },
      })
      hatali++
    }
  }

  return NextResponse.json({ ok: true, yayinlanan, hatali, toplam: zamaniGelenler.length })
}
