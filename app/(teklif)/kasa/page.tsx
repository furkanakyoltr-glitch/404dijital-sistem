"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Lock } from 'lucide-react'

export default function KasaPage() {
  const router = useRouter()
  const [kasaNo, setKasaNo] = useState('')

  const handleGit = (e: React.FormEvent) => {
    e.preventDefault()
    const temiz = kasaNo.trim()
    if (temiz) router.push(`/kasa/${temiz}`)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 text-green-400 text-xs font-mono mb-6">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          ENCRYPTED CONNECTION ESTABLISHED
        </div>
        <h1 className="font-bebas text-5xl tracking-[6px] text-white mb-2">404 SECURE</h1>
        <h2 className="font-bebas text-2xl tracking-[4px] text-[#ffc107] mb-10">TEKLİF KASASI</h2>

        <form onSubmit={handleGit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="KASA NO GİRİN (ÖRN: 404-001)"
              value={kasaNo}
              onChange={e => setKasaNo(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-4 text-white text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-[#ffc107]/50 text-center tracking-wider"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!kasaNo.trim()}
            className="w-full bg-[#ffc107] hover:bg-[#e6b000] text-black font-bebas text-lg tracking-wider rounded-xl py-4 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Lock size={18} />
            KASAYI AÇ
          </button>
        </form>

        <p className="text-gray-600 font-mono text-xs mt-8">
          Kasa numaranızı 404 Dijital ekibinden alabilirsiniz
        </p>
      </div>
    </div>
  )
}
