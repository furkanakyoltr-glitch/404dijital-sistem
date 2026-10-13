"use client"
import { Phone, MessageCircle } from 'lucide-react'
import { trackContactClick } from '@/lib/tracking'

export function StickyCtaBar() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a1a] border-t border-white/10 px-4 py-3 flex gap-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
      <a
        href="tel:+905446844067"
        onClick={() => trackContactClick('phone')}
        className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-montserrat font-bold text-sm py-3 rounded-full"
      >
        <Phone size={16} /> ARA
      </a>
      <a
        href="https://wa.me/905446844067?text=Merhaba,%20ücretsiz%20analiz%20istiyorum."
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackContactClick('whatsapp')}
        className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-montserrat font-bold text-sm py-3 rounded-full"
      >
        <MessageCircle size={16} /> WHATSAPP
      </a>
    </div>
  )
}
