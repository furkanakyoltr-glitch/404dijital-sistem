import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendOnayAdminBildirim } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  const { kasaNo } = await req.json()
  const musteri = await prisma.musteri.findUnique({ where: { kasaNo } })
  if (!musteri) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  await prisma.musteri.update({ where: { kasaNo }, data: { durum: 'aktif' } })
  await prisma.teklif.updateMany({ where: { musteriId: musteri.id, durum: 'bekliyor' }, data: { durum: 'onaylandi', onayTarihi: new Date() } })

  // Bu müşteri bir lead'den geldiyse: durumu "kazandı" yap, geçmişe not düş
  // (migration henüz uygulanmadıysa sessizce atla — asıl onay akışını bozmasın)
  try {
    const bagliLead = await prisma.lead.findUnique({ where: { musteriId: musteri.id } })
    if (bagliLead) {
      await prisma.lead.update({ where: { id: bagliLead.id }, data: { durum: 'kazandi' } })
      await prisma.leadNot.create({
        data: { leadId: bagliLead.id, icerik: `Teklif onaylandı — müşteri aktif oldu (Kasa: ${kasaNo}).` },
      })
    }
  } catch (leadSyncErr) {
    console.error('Lead senkronizasyon hatası (onay akışını etkilemez):', leadSyncErr)
  }

  sendOnayAdminBildirim(musteri.firmaAdi, kasaNo).catch(() => {})
  return NextResponse.json({ success: true })
}
