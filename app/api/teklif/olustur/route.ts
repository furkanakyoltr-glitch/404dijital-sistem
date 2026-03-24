import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generatePassword } from '@/lib/utils'
import { sendTeklifMaili } from '@/lib/mail'

async function generateUniqueKasaNo(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const num = Math.floor(Math.random() * 8900) + 1000
    const kasaNo = `404-${num}`
    const existing = await prisma.musteri.findUnique({ where: { kasaNo } })
    if (!existing) return kasaNo
  }
  // Fallback: timestamp bazlı
  return `404-${Date.now().toString().slice(-6)}`
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin')
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await req.json()
    const {
      firmaAdi, yetkiliKisi, yetkiliUnvan, telefon, email, adres, vergiDairesi, vergiNo, notlar,
      paketKategori, paketAdi, paketDetay, stratejiNotu, fiyat, ekGiderler, islerListesi,
      indirim, kdvOrani, toplam, gecerlilikTarihi, sendEmail, sendWhatsapp
    } = body

    const kasaNo = await generateUniqueKasaNo()
    const sifre = generatePassword()
    const hashedSifre = await bcrypt.hash(sifre, 10)

    const musteri = await prisma.musteri.create({
      data: {
        firmaAdi, yetkiliKisi, yetkiliUnvan: yetkiliUnvan || null,
        telefon, email, adres: adres || null,
        vergiDairesi: vergiDairesi || null, vergiNo: vergiNo || null, notlar: notlar || null,
        kasaNo, sifre: hashedSifre,
        durum: 'odeme_alinacak',
      }
    })

    const teklif = await prisma.teklif.create({
      data: {
        teklifNo: kasaNo, musteriId: musteri.id, paketKategori, paketAdi,
        paketDetay: paketDetay || null, stratejiNotu: stratejiNotu || null,
        fiyat: parseFloat(String(fiyat)), ekGiderler, islerListesi,
        indirim: parseFloat(String(indirim || 0)),
        kdvOrani: parseFloat(String(kdvOrani || 20)),
        toplam: parseFloat(String(toplam)),
        gecerlilikTarihi: new Date(gecerlilikTarihi),
        olusturanAdminId: (session.user as any).id || null,
      }
    })

    // Email opsiyonel
    if (sendEmail !== false) {
      try {
        await sendTeklifMaili({
          yetkiliAdi: yetkiliKisi, firmaAdi, kasaNo, paketAdi,
          toplam: parseFloat(String(toplam)), gecerlilikTarihi, sifre, musteriEmail: email
        })
      } catch (emailErr) {
        console.error('Email gönderilemedi:', emailErr)
      }
    }

    // WhatsApp/Make webhook — teklifi müşteri telefonuna gönder
    const makeUrl = process.env.MAKE_TEKLIF_WEBHOOK_URL
    if (makeUrl && telefon) {
      try {
        const teklifLink = `https://teklif.404dijital.com/${kasaNo}`
        await fetch(makeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'teklif_gonder',
            telefon: telefon.replace(/\s+/g, '').replace(/^0/, '+90'),
            firmaAdi,
            yetkiliKisi,
            kasaNo,
            paketAdi,
            toplam: parseFloat(String(toplam)),
            teklifLink,
            furkanNo: '+905446844067',
          }),
        })
      } catch (wpErr) {
        console.error('Make webhook hatası:', wpErr)
      }
    }

    return NextResponse.json({ success: true, kasaNo, sifre, musteriId: musteri.id, teklifId: teklif.id })
  } catch (err: any) {
    console.error('Teklif oluşturma hatası:', err)
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 })
  }
}
