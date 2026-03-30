import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/session-provider'

export const metadata: Metadata = {
  title: '404 Dijital | Reklam Ajansı — Sosyal Medya Değil, Gerçek Pazarlama',
  description: '404 Dijital, Türkiye\'nin sonuç odaklı reklam ajansı. Meta Ads, Google Ads, video prodüksiyon ve marka stratejisiyle cironuzu artırıyoruz. Sosyal medya değil, gerçek pazarlama.',
  keywords: [
    'reklam ajansı', 'dijital pazarlama ajansı', 'Meta Ads ajansı', 'Google Ads ajansı',
    'sosyal medya yönetimi', 'marka stratejisi', 'video prodüksiyon', 'e-ticaret reklamı',
    '404 dijital', 'performans pazarlama', 'ciro artırma', 'İstanbul reklam ajansı',
    'Türkiye reklam ajansı', 'reels video', 'instagram yönetimi', 'tiktok reklam',
  ],
  authors: [{ name: '404 Dijital' }],
  creator: '404 Dijital',
  metadataBase: new URL('https://404dijital.com'),
  alternates: { canonical: 'https://404dijital.com' },
  openGraph: {
    title: '404 Dijital | Sosyal Medya Değil, Gerçek Pazarlama',
    description: 'Ciro artırma, sosyal medya yönetimi ve 360° pazarlama paketleriyle işletmenizi büyütüyoruz. Meta Ads, Google Ads ve video prodüksiyon uzmanları.',
    url: 'https://404dijital.com',
    siteName: '404 Dijital',
    locale: 'tr_TR',
    type: 'website',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: '404 Dijital Reklam Ajansı' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '404 Dijital | Reklam Ajansı',
    description: 'Sosyal medya değil, gerçek pazarlama. Meta Ads, Google Ads ve video prodüksiyon.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  verification: { google: '' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
