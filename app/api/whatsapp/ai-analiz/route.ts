import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY tanımlı değil. Railway değişkenlerine eklenmesi gerekiyor.' }, { status: 503 })
  }

  const sonTarih = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const mesajlar = await prisma.wPSohbetMesaj.findMany({
    where: { yon: 'gelen', createdAt: { gte: sonTarih }, icerik: { not: '' } },
    orderBy: { createdAt: 'desc' },
    take: 300,
    select: { icerik: true, createdAt: true },
  })

  if (mesajlar.length === 0) {
    return NextResponse.json({ ozet: 'Son 30 günde analiz edilecek yeterli müşteri mesajı yok.', mesajSayisi: 0 })
  }

  const metinListesi = mesajlar.map(m => `- ${m.icerik}`).join('\n')

  const prompt = `Aşağıda 404 Dijital adlı bir dijital pazarlama ajansının WhatsApp hattına son 30 günde gelen müşteri/potansiyel müşteri mesajları listelenmiştir. Bu mesajları analiz et ve şu başlıklarda kısa, somut bir Türkçe rapor ver:

1. En sık tekrar eden konular/talepler (madde madde)
2. Sık karşılaşılan itirazlar veya tereddütler (varsa)
3. Fiyat/bütçe ile ilgili sorular var mı, ne soruluyor
4. Genel ton ve dikkat çeken içgörüler
5. Somut bir öneri (satış/pazarlama ekibinin bugün yapabileceği bir aksiyon)

Mesajlar:
${metinListesi}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-5-5',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data?.error?.message || 'AI analiz isteği başarısız' }, { status: 502 })
    }
    const ozet = data?.content?.[0]?.text || 'Yanıt alınamadı.'
    return NextResponse.json({ ozet, mesajSayisi: mesajlar.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bağlantı hatası' }, { status: 500 })
  }
}
