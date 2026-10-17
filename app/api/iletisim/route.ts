import { NextRequest, NextResponse } from 'next/server'
import { createLead } from '@/lib/leads'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.type === 'analiz') {
      await createLead({
        firmaAdi: body.isletmeAdi,
        telefon: body.telefon,
        kaynak: body.kaynak || 'Web Sitesi - Hızlı Analiz Formu',
        reklamDetay: body.reklamDetay,
      })
    } else if (body.type === 'newsletter') {
      await createLead({
        email: body.email,
        kaynak: 'Web Sitesi - Haber Bülteni',
      })
    } else {
      await createLead({
        adSoyad: body.isim,
        email: body.email,
        telefon: body.telefon,
        mesaj: body.mesaj,
        hizmetIlgisi: body.hizmet || body.sektor,
        kaynak: 'Web Sitesi - İletişim Formu',
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Lead kaydı hatası:', err)
    return NextResponse.json({ error: 'Islem basarisiz' }, { status: 500 })
  }
}
