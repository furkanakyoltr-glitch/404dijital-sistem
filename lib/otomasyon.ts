import prisma from './prisma'
import { sendWAText } from './whatsapp'

type OtomasyonBaglam = {
  atananAdi?: string
  atananTelefon?: string | null
  gorevBaslik?: string
  panoAdi?: string
  departman: string
}

function mesajDoldur(sablon: string, baglam: OtomasyonBaglam): string {
  return sablon
    .replaceAll('{isim}', baglam.atananAdi || '')
    .replaceAll('{gorevBaslik}', baglam.gorevBaslik || '')
    .replaceAll('{panoAdi}', baglam.panoAdi || '')
}

// tetikleyici: "gorev_atandi" | "gorev_tamamlandi"
export async function otomasyonlariCalistir(tetikleyici: string, baglam: OtomasyonBaglam) {
  try {
    const kurallar = await prisma.otomasyon.findMany({
      where: {
        tetikleyici,
        aktif: true,
        OR: [{ departman: 'tumu' }, { departman: baglam.departman }],
      },
    })

    for (const kural of kurallar) {
      const mesaj = mesajDoldur(kural.mesaj, baglam)
      let basarili = false
      let hata: string | undefined

      if (!baglam.atananTelefon) {
        hata = 'Atanan kişinin telefon numarası kayıtlı değil'
      } else {
        const sonuc = await sendWAText(baglam.atananTelefon, mesaj)
        basarili = sonuc.ok
        hata = sonuc.hata
      }

      await prisma.otomasyonLog.create({
        data: {
          otomasyonId: kural.id,
          otomasyonAdi: kural.ad,
          hedefTelefon: baglam.atananTelefon || null,
          mesaj,
          basarili,
          hata: hata || null,
        },
      })

      await prisma.otomasyon.update({
        where: { id: kural.id },
        data: { sonCalisma: new Date(), calismaSayisi: { increment: 1 } },
      })
    }
  } catch (e) {
    console.error('Otomasyon çalıştırma hatası:', e)
  }
}
