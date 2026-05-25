"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNav = (id: string) => {
    setMobileOpen(false)
    if (isHome) {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = `/#${id}`
    }
  }

  const navLeft = [
    { label: 'Biz Kimiz?', id: 'about' },
    { label: 'Nasıl Çalışıyoruz?', id: 'process' },
  ]
  const navRight = [
    { label: 'Paketlerimiz', id: 'packages' },
    { label: 'VANTAGE LAB', id: 'vantage' },
    { label: 'İletişim', id: 'contact' },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{ background: 'rgba(5,5,5,0.93)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLeft.map(({ label, id }) => (
              <button key={id} onClick={() => handleNav(id)} className="nav-btn">{label}</button>
            ))}
          </div>

          {/* Logo */}
          {isHome ? (
            <button
              onClick={() => handleNav('home')}
              className="font-bebas text-2xl text-white tracking-[4px] hover:text-gold transition-colors"
            >
              404 DİJİTAL
            </button>
          ) : (
            <Link href="/" className="font-bebas text-2xl text-white tracking-[4px] hover:text-gold transition-colors">
              404 DİJİTAL
            </Link>
          )}

          {/* Right nav */}
          <div className="hidden md:flex items-center gap-1">
            {navRight.map(({ label, id }) => (
              <button key={id} onClick={() => handleNav(id)} className="nav-btn">{label}</button>
            ))}
            <a href="https://404strateji.com" target="_blank" rel="noopener noreferrer" className="nav-btn">Strateji</a>
            <Link href="/blog" className={`nav-btn ${pathname.startsWith('/blog') ? 'text-[#ffc107]' : ''}`}>
              Blog
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            <div className="w-6 h-0.5 bg-white mb-1.5" />
            <div className="w-6 h-0.5 bg-white mb-1.5" />
            <div className="w-6 h-0.5 bg-white" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-black/95 border-t border-white/10 px-4 py-4 flex flex-col gap-2">
          {[...navLeft, ...navRight].map(({ label, id }) => (
            <button key={id} onClick={() => handleNav(id)} className="text-white text-left py-2 border-b border-white/10 font-montserrat font-semibold hover:text-yellow-400 transition-colors">
              {label}
            </button>
          ))}
          <a href="https://404strateji.com" target="_blank" rel="noopener noreferrer" className="text-white py-2 font-montserrat font-semibold hover:text-yellow-400 transition-colors">
            Strateji
          </a>
          <Link href="/blog" onClick={() => setMobileOpen(false)} className="text-white py-2 font-montserrat font-semibold hover:text-yellow-400 transition-colors">
            Blog
          </Link>
        </div>
      )}
    </nav>
  )
}
