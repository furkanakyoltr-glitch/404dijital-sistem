"use client"
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function TransitionLayer() {
  const [active, setActive] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setActive(true)
    const timer = setTimeout(() => setActive(false), 2000)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div
      className={`transition-layer ${active ? 'active' : ''}`}
      style={{ pointerEvents: active ? 'all' : 'none' }}
    >
      <div className="flex items-center gap-4">
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 8l4-4 4 4M2 16l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        </svg>
        <span>404 DİJİTAL</span>
      </div>
    </div>
  )
}
