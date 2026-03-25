import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generatePassword } from '@/lib/utils'
import { sendTeklifMaili } from '@/lib/mail'
import { sendTeklifWP } from '@/lib/whatsapp'

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
      indirim, indirimTipi, kdvOrani, toplam, gecerlilikTarihi, sendEmail, sendWhatsapp
    } = body

    // indirim her zaman TL olarak kaydet (yüzde tipiyse dönüştür)
    const araToplam = parseFloat(String(fiyat || 0)) + ((ekGiderler as any[])?.reduce((s: number, e: any) => s + (e.tutar || 0), 0) || 0)
    const indirimTL = indirimTipi === 'yuzde'
      ? araToplam * parseFloat(String(indirim || 0)) / 100
      : parseFloat(String(indirim || 0))

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
        indirim: indirimTL,
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

    // WhatsApp — direkt WA Cloud API
    let wpDurum = 'gonderilmedi'
    if (sendWhatsapp !== false && telefon) {
      try {
        const wpOk = await sendTeklifWP({ telefon, yetkiliKisi, firmaAdi, kasaNo, paketAdi, toplam: parseFloat(String(toplam)) })
        if (wpOk) {
          await prisma.teklif.update({ where: { id: teklif.id }, data: { wpGonderimZamani: new Date() } })
          wpDurum = 'gonderildi'
        } else {
          wpDurum = 'hata'
          console.error('WP gönderilemedi — sendTeklifWP false döndü. Telefon:', telefon)
        }
      } catch (wpErr) {
        wpDurum = 'hata'
        console.error('WP gönderim hatası:', wpErr)
      }
    }

    return NextResponse.json({ success: true, kasaNo, sifre, musteriId: musteri.id, teklifId: teklif.id, wpDurum })
  } catch (err: any) {
    console.error('Teklif oluşturma hatası:', err)
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 })
  }
}
