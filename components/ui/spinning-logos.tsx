"use client"
import { useEffect, useRef } from 'react'

const LOGOS = ['Instagram', 'TikTok', 'Google', 'Meta', 'E-Ticaret', 'Kurumsal', 'Sağlık', 'Gayrimenkul']

const ICONS: Record<string, string> = {
  Instagram: 'IG',
  TikTok: 'TT',
  Google: 'G',
  Meta: 'M',
  'E-Ticaret': 'EC',
  Kurumsal: 'KP',
  Sağlık: 'SG',
  Gayrimenkul: 'GR',
}

export function SpinningLogos() {
  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className="flex items-center gap-12 animate-[scroll_25s_linear_infinite] whitespace-nowrap">
        {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-6 py-3 bg-white border border-[#eaeaea] rounded-full shadow-sm flex-shrink-0"
          >
            <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {ICONS[logo]}
            </div>
            <span className="text-[#1a1a1a] font-montserrat font-semibold text-sm">{logo}</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  )
}
