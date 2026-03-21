"use client"
import { useState } from 'react'

export function Footer() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setEmail('')
  }

  return (
    <footer className="bg-[#1a1a1a] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="font-bebas text-3xl tracking-[4px] mb-4">404 DİJİTAL</div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Sosyal Medya Değil, Reklam Ajansı! Strateji ve satış odaklı yaklaşımımızla işletmenizin büyümesini hızlandırıyoruz.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com/404.dijital" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ffc107] hover:text-black transition-all text-sm font-bold">IG</a>
              <a href="https://facebook.com/404-Dijital-61557160807361" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ffc107] hover:text-black transition-all text-sm font-bold">FB</a>
              <a href="https://wa.me/905446844067" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#25D366] transition-all text-sm font-bold">WA</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bebas text-xl tracking-wider mb-4 text-[#ffc107]">HIZLI LİNKLER</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {[['Biz Kimiz?','about'],['Nasıl Çalışıyoruz?','process'],['Paketlerimiz','packages'],['VANTAGE LAB','vantage'],['İletişim','contact']].map(([label, id]) => (
                <li key={id}>
                  <button onClick={() => { const el = document.getElementById(id); el?.scrollIntoView({behavior:'smooth'}) }}
                    className="hover:text-white transition-colors">{label}</button>
                </li>
              ))}
              <li><a href="https://404strateji.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">404 Strateji</a></li>
            </ul>
          </div>

          {/* Newsletter + Contact */}
          <div>
            <h4 className="font-bebas text-xl tracking-wider mb-4 text-[#ffc107]">HABER BÜLTENİ</h4>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="mb-6">
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ffc107] mb-2"
                  required
                />
                <button type="submit" className="btn-primary w-full text-sm">ABONE OL</button>
              </form>
            ) : (
              <p className="text-[#ffc107] text-sm mb-6">✅ Abone oldunuz! Teşekkürler.</p>
            )}
            <div className="space-y-2 text-gray-400 text-sm">
              <p>📞 <a href="tel:+905446844067" className="hover:text-white">+90 544 684 40 67</a></p>
              <p>📧 <a href="mailto:info@404dijital.com" className="hover:text-white">info@404dijital.com</a></p>
              <p>📍 Çınarlı 1572/1. Sk. No:33 35170 Konak/İzmir</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs">
          <p>© 2026 404 Dijital. Tüm hakları saklıdır.</p>
          <p>Strateji ve satış odaklı reklam ajansı</p>
        </div>
      </div>
    </footer>
  )
}
