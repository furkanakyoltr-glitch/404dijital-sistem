"use client"
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Search, Lock, CheckCircle, Clock, Archive, Circle } from 'lucide-react'

interface KasaItem {
  kasaNo: string
  durum: 'aktif' | 'bekliyor' | 'bos' | 'arsiv'
  firmaAdi?: string
}

const DURUM_CONFIG = {
  aktif: { label: 'AKTİF', color: '#22c55e', bg: '#f0fdf4', icon: CheckCircle },
  bekliyor: { label: 'BEKLİYOR', color: '#f59e0b', bg: '#fffbeb', icon: Clock },
  bos: { label: 'BOŞ', color: '#9ca3af', bg: '#f9fafb', icon: Circle },
  arsiv: { label: 'ARŞİV', color: '#3b82f6', bg: '#eff6ff', icon: Archive },
}

export default function KasaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [kasalar, setKasalar] = useState<KasaItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/'); return }
    if (status === 'authenticated') fetchKasalar()
  }, [status])

  const fetchKasalar = async () => {
    try {
      const res = await fetch('/api/kasalar')
      const data = await res.json()
      setKasalar(data)
    } catch {
      // Demo data
      setKasalar([
        { kasaNo: '404-001', durum: 'bekliyor', firmaAdi: session?.user?.name || '' },
        { kasaNo: '404-002', durum: 'aktif' },
        { kasaNo: '404-003', durum: 'bos' },
        { kasaNo: '404-004', durum: 'arsiv' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredKasalar = kasalar.filter(k =>
    k.kasaNo.toLowerCase().includes(search.toLowerCase())
  )

  const handleKasaClick = (kasaNo: string, durum: string) => {
    if (durum === 'bos') return
    router.push(`/kasa/${kasaNo}`)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-white font-bebas text-2xl tracking-wider animate-pulse">YÜKLENIYOR...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-green-400 text-xs font-mono mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            ENCRYPTED CONNECTION ESTABLISHED
          </div>
          <h1 className="font-bebas text-5xl tracking-[6px] text-white mb-2">404 SECURE</h1>
          <h2 className="font-bebas text-2xl tracking-[4px] text-[#ffc107]">TEKLİF KASASI</h2>
          <p className="text-gray-400 font-mono text-sm mt-3">
            Hoş geldiniz, <span className="text-white font-semibold">{session?.user?.name}</span>
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="KASA NO (ÖRN: 404-001)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-[#ffc107]/50"
          />
        </div>

        {/* Kasalar Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {filteredKasalar.map(kasa => {
            const config = DURUM_CONFIG[kasa.durum]
            const Icon = config.icon
            const isClickable = kasa.durum !== 'bos'

            return (
              <div
                key={kasa.kasaNo}
                onClick={() => handleKasaClick(kasa.kasaNo, kasa.durum)}
                className={`relative border rounded-xl p-5 transition-all duration-200 font-mono ${
                  isClickable
                    ? 'border-white/10 hover:border-[#ffc107]/50 cursor-pointer hover:bg-white/5'
                    : 'border-white/5 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl text-white font-bebas tracking-wider">#{kasa.kasaNo}</span>
                  <Icon size={16} style={{ color: config.color }} />
                </div>
                <div
                  className="text-xs font-bold px-2 py-0.5 rounded-full inline-block"
                  style={{ color: config.color, background: config.bg + '33', border: `1px solid ${config.color}33` }}
                >
                  {config.label}
                </div>
                {kasa.firmaAdi && (
                  <p className="text-gray-400 text-xs mt-2 truncate">{kasa.firmaAdi}</p>
                )}
                {isClickable && (
                  <div className="absolute bottom-3 right-3">
                    <Lock size={12} className="text-gray-600" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Sign out */}
        <div className="text-center">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-gray-500 hover:text-gray-300 text-xs font-mono transition-colors"
          >
            ÇIKIŞ YAP
          </button>
        </div>
      </div>
    </div>
  )
}
