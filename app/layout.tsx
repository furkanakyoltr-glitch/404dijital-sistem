import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/session-provider'

export const metadata: Metadata = {
  title: '404 Dijital | Reklam Ajansı',
  description: 'Sosyal Medya Değil, Reklam Ajansı!',
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
