import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 8000,
  socketTimeout: 8000,
  greetingTimeout: 8000,
})

export async function sendMail({ to, subject, html }: { to: string | string[]; subject: string; html: string }) {
  const smtpPass = process.env.SMTP_PASS
  if (!smtpPass || smtpPass === 'changeme') {
    console.warn('SMTP_PASS ayarlı değil, mail atlanıyor.')
    return
  }
  const toArray = (Array.isArray(to) ? to : [to]).filter(Boolean)
  if (toArray.length === 0) return
  return transporter.sendMail({
    from: `"404 Dijital" <${process.env.SMTP_USER}>`,
    to: toArray.join(', '),
    subject,
    html,
  })
}

export async function sendTeklifMaili({
  yetkiliAdi, firmaAdi, kasaNo, paketAdi, toplam, gecerlilikTarihi, sifre, musteriEmail,
}: {
  yetkiliAdi: string; firmaAdi: string; kasaNo: string; paketAdi: string;
  toplam: number; gecerlilikTarihi: string; sifre: string; musteriEmail: string;
}) {
  const html = `
    <div style="font-family: Montserrat, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 40px 20px;">
      <div style="background: #1a1a1a; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; font-size: 2rem; letter-spacing: 4px; margin: 0;">404 DİJİTAL</h1>
      </div>
      <div style="background: #fff; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #eaeaea;">
        <p style="color: #555; font-size: 16px;">Merhaba <strong>${yetkiliAdi}</strong>,</p>
        <p style="color: #555;">Görüştüğümüz teklifiniz hazır.</p>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1a1a1a; margin-top: 0;">📋 TEKLİF ÖZETİ</h3>
          <p style="margin: 5px 0;"><strong>Teklif No:</strong> #${kasaNo}</p>
          <p style="margin: 5px 0;"><strong>Paket:</strong> ${paketAdi}</p>
          <p style="margin: 5px 0;"><strong>Toplam Tutar:</strong> ${toplam.toLocaleString('tr-TR')} ₺</p>
          <p style="margin: 5px 0;"><strong>Geçerlilik:</strong> ${gecerlilikTarihi}</p>
        </div>
        <div style="background: #1a1a1a; color: #fff; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #ffc107;">🔐 TEKLİFİ GÖRÜNTÜLE</h3>
          <p style="margin: 5px 0;"><strong>Giriş Linki:</strong> https://teklif.404dijital.com</p>
          <p style="margin: 5px 0;"><strong>Kasa No:</strong> ${kasaNo}</p>
          <p style="margin: 5px 0;"><strong>Şifre:</strong> ${sifre}</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://teklif.404dijital.com" style="background: #1a1a1a; color: #fff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">TEKLİFİ İNCELE</a>
        </div>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
        <p style="color: #555; font-size: 14px; text-align: center;">
          📞 +90 544 684 40 67 | 📧 info@404dijital.com<br>
          Çınarlı 1572/1. Sk. No:33 35170 Konak/İzmir
        </p>
      </div>
    </div>
  `
  await sendMail({ to: musteriEmail, subject: `404 Dijital Teklifiniz Hazır - ${firmaAdi}`, html })
  await sendMail({
    to: [process.env.ADMIN_MAIL_1!, process.env.ADMIN_MAIL_2!],
    subject: `📋 Yeni Teklif Oluşturuldu - ${firmaAdi} (#${kasaNo})`,
    html: `<p>Yeni teklif oluşturuldu. Firma: ${firmaAdi}, Kasa: #${kasaNo}, Tutar: ${toplam.toLocaleString('tr-TR')} ₺</p>`,
  })
}

export async function sendOnayMaili({ firmaAdi, kasaNo, yetkiliEmail }: { firmaAdi: string; kasaNo: string; yetkiliEmail: string }) {
  const adminHtml = `<div style="font-family:sans-serif;padding:20px;"><h2 style="color:#22c55e;">✅ ${firmaAdi} teklifi onayladı!</h2><p>Kasa No: #${kasaNo}</p><p>Hemen aksiyon alın.</p></div>`
  const musteriHtml = `<div style="font-family:sans-serif;padding:20px;"><h2>Teklifiniz Onaylandı!</h2><p>Merhaba, #${kasaNo} numaralı teklifinizi onayladınız. Ekibimiz en kısa sürede sizinle iletişime geçecek.</p><p>📞 +90 544 684 40 67</p></div>`
  await sendMail({ to: [process.env.ADMIN_MAIL_1!, process.env.ADMIN_MAIL_2!], subject: `✅ ${firmaAdi} teklifi onayladı - Kasa #${kasaNo}`, html: adminHtml })
  await sendMail({ to: yetkiliEmail, subject: `✅ Teklifiniz Onaylandı - 404 Dijital`, html: musteriHtml })
}
