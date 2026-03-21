import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '@/lib/mail'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, isletmeAdi, telefon, isim, email, mesaj } = body
    const subject = type === 'analiz' 
      ? `🔍 Ücretsiz Analiz Talebi - ${isletmeAdi}`
      : `📧 İletişim Formu - ${isim}`
    const html = type === 'analiz'
      ? `<h3>Ücretsiz Analiz Talebi</h3><p><strong>İşletme:</strong> ${isletmeAdi}</p><p><strong>Telefon:</strong> ${telefon}</p>`
      : `<h3>İletişim Formu</h3><p><strong>İsim:</strong> ${isim}</p><p><strong>E-posta:</strong> ${email}</p><p><strong>Telefon:</strong> ${telefon}</p><p><strong>Mesaj:</strong> ${mesaj}</p>`
    await sendMail({ to: [process.env.ADMIN_MAIL_1!, process.env.ADMIN_MAIL_2!], subject, html })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Mail gönderilemedi' }, { status: 500 }) }
}
