import prisma from './prisma'
import { sendWAText, sendWATemplate } from './whatsapp'

const ONAYLI_SABLONLAR: Record<string, string> = {
  gorev_atandi: 'gorev_atama_bildirimi',
  gorev_tamamlandi: 'gorev_tamamlandi_bildirimi',
}

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
        // 1) Önce serbest metin dene (son 24 saatte bize yazdıysa gider)
        const serbestSonuc = await sendWAText(baglam.atananTelefon, mesaj)
        basarili = serbestSonuc.ok
        hata = serbestSonuc.hata

        // 2) Serbest metin gitmediyse, onaylı şablon varsa ona düş (pencere kısıtı olmadan gider)
        if (!basarili) {
          const sablonAdi = ONAYLI_SABLONLAR[tetikleyici]
          if (sablonAdi) {
            const sablonBasarili = await sendWATemplate(baglam.atananTelefon, sablonAdi, [
              baglam.atananAdi || '',
              baglam.gorevBaslik || '',
            ])
            if (sablonBasarili) {
              basarili = true
              hata = undefined
            } else {
              hata = `${hata || 'Serbest metin başarısız'} (şablon da başarısız veya henüz onaylanmadı: ${sablonAdi})`
            }
          }
        }
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
