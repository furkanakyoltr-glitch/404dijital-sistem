import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateKasaNo, generatePassword } from '@/lib/utils'
import { sendTeklifMaili } from '@/lib/mail'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin')
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const body = await req.json()
  const {
    firmaAdi, yetkiliKisi, yetkiliUnvan, telefon, email, adres, vergiDairesi, vergiNo, notlar,
    paketKategori, paketAdi, paketDetay, stratejiNotu, fiyat, ekGiderler, islerListesi,
    indirim, kdvOrani, toplam, gecerlilikTarihi, odemeKosullari, sendEmail
  } = body

  const kasaNo = generateKasaNo()
  const sifre = generatePassword()
  const hashedSifre = await bcrypt.hash(sifre, 10)

  const musteri = await prisma.musteri.create({
    data: {
      firmaAdi, yetkiliKisi, yetkiliUnvan, telefon, email,
      adres, vergiDairesi, vergiNo, notlar,
      kasaNo, sifre: hashedSifre,
      durum: 'odeme_alinacak',
    }
  })

  const teklif = await prisma.teklif.create({
    data: {
      teklifNo: kasaNo, musteriId: musteri.id, paketKategori, paketAdi, paketDetay, stratejiNotu,
      fiyat: parseFloat(fiyat), ekGiderler, islerListesi,
      indirim: parseFloat(indirim || 0),
      kdvOrani: parseFloat(kdvOrani || 20),
      toplam: parseFloat(toplam),
      gecerlilikTarihi: new Date(gecerlilikTarihi),
      olusturanAdminId: (session.user as any).id,
    }
  })

  // Email opsiyonel — hata olsa bile teklif oluşur
  if (sendEmail !== false) {
    try {
      await sendTeklifMaili({
        yetkiliAdi: yetkiliKisi, firmaAdi, kasaNo, paketAdi,
        toplam: parseFloat(toplam), gecerlilikTarihi, sifre, musteriEmail: email
      })
    } catch (emailErr) {
      console.error('Email gönderilemedi:', emailErr)
    }
  }

  return NextResponse.json({ success: true, kasaNo, sifre, musteriId: musteri.id, teklifId: teklif.id })
}
