import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: '404 Dijital | Teklif Portalı',
  description: 'Güvenli teklif portalınız',
}

export default function TeklifLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {children}
    </div>
  )
}
