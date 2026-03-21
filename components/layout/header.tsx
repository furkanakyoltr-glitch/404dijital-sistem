"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    setMobileOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{ background: 'rgba(5,5,5,0.93)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left nav */}
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => scrollTo('about')} className="nav-btn">Biz Kimiz?</button>
            <button onClick={() => scrollTo('process')} className="nav-btn">Nasıl Çalışıyoruz?</button>
          </div>

          {/* Logo */}
          <button
            onClick={() => scrollTo('home')}
            className="font-bebas text-2xl text-white tracking-[4px] hover:text-gold transition-colors"
          >
            404 DİJİTAL
          </button>

          {/* Right nav */}
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => scrollTo('packages')} className="nav-btn">Paketlerimiz</button>
            <a href="https://404strateji.com" target="_blank" rel="noopener noreferrer" className="nav-btn">Strateji</a>
            <button onClick={() => scrollTo('vantage')} className="nav-btn">VANTAGE LAB</button>
            <button onClick={() => scrollTo('contact')} className="nav-btn">İletişim</button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-black/95 border-t border-white/10 px-4 py-4 flex flex-col gap-2">
          {[['Biz Kimiz?','about'],['Nasıl Çalışıyoruz?','process'],['Paketlerimiz','packages'],['VANTAGE LAB','vantage'],['İletişim','contact']].map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)} className="text-white text-left py-2 border-b border-white/10 font-montserrat font-semibold hover:text-yellow-400 transition-colors">
              {label}
            </button>
          ))}
          <a href="https://404strateji.com" target="_blank" rel="noopener noreferrer" className="text-white py-2 font-montserrat font-semibold hover:text-yellow-400 transition-colors">
            Strateji
          </a>
        </div>
      )}
    </nav>
  )
}
