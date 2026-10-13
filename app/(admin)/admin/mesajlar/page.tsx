"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, MessageCircle, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function MesajlarPage() {
  const [sohbetler, setSohbetler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [seciliId, setSeciliId] = useState<string | null>(null)
  const [sohbet, setSohbet] = useState<any | null>(null)
  const [yeniMesaj, setYeniMesaj] = useState('')
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [hata, setHata] = useState('')
  const mesajSonuRef = useRef<HTMLDivElement>(null)

  const fetchSohbetler = useCallback(async () => {
    const res = await fetch('/api/whatsapp/sohbetler')
    const data = await res.json()
    setSohbetler(data.data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSohbetler()
    const interval = setInterval(fetchSohbetler, 15000) // 15sn'de bir yeni mesaj kontrolü
    return () => clearInterval(interval)
  }, [fetchSohbetler])

  const sohbetAc = async (id: string) => {
    setSeciliId(id)
    const res = await fetch(`/api/whatsapp/sohbetler/${id}`)
    const data = await res.json()
    setSohbet(data)
    setSohbetler(prev => prev.map(s => (s.id === id ? { ...s, okunmadi: false } : s)))
  }

  useEffect(() => {
    mesajSonuRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sohbet?.mesajlar?.length])

  const gonder = async () => {
    const icerik = yeniMesaj.trim()
    if (!icerik || !seciliId) return
    setGonderiliyor(true)
    setHata('')
    try {
      const res = await fetch('/api/whatsapp/gonder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sohbetId: seciliId, icerik }),
      })
      const data = await res.json()
      if (data.success) {
        setSohbet((prev: any) => ({ ...prev, mesajlar: [...prev.mesajlar, data.mesaj] }))
        setYeniMesaj('')
        fetchSohbetler()
      } else {
        setHata(data.error || 'Gönderilemedi')
      }
    } finally {
      setGonderiliyor(false)
    }
  }

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-2xl border border-[#eaeaea] overflow-hidden">
      {/* Sohbet Listesi */}
      <div className="w-80 border-r border-[#eaeaea] flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-[#eaeaea]">
          <h2 className="font-bebas text-xl tracking-wider text-[#1a1a1a] flex items-center gap-2">
            <MessageCircle size={18} /> MESAJLAR
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-[#999] text-sm py-8 font-montserrat">Yükleniyor...</p>
          ) : sohbetler.length === 0 ? (
            <p className="text-center text-[#999] text-sm py-8 font-montserrat px-4">
              Henüz gelen mesaj yok. WhatsApp webhook kurulunca müşteri mesajları burada görünecek.
            </p>
          ) : (
            sohbetler.map(s => (
              <button
                key={s.id}
                onClick={() => sohbetAc(s.id)}
                className={`w-full text-left px-4 py-3 border-b border-[#f0f0f0] hover:bg-[#f8f9fa] transition-colors ${seciliId === s.id ? 'bg-[#f8f9fa]' : ''}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-montserrat font-semibold text-sm text-[#1a1a1a] truncate">{s.isim || s.telNo}</span>
                  {s.okunmadi && <span className="w-2 h-2 bg-[#25D366] rounded-full flex-shrink-0" />}
                </div>
                <p className="text-xs text-[#999] truncate font-montserrat">{s.sonMesaj}</p>
                {s.sonMesajZamani && <p className="text-[10px] text-[#ccc] mt-0.5">{formatDate(s.sonMesajZamani)}</p>}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Sohbet Detayı */}
      <div className="flex-1 flex flex-col">
        {!sohbet ? (
          <div className="flex-1 flex items-center justify-center text-[#999] font-montserrat text-sm">
            Mesajları görmek için soldan bir sohbet seçin.
          </div>
        ) : (
          <>
            <div className="px-5 py-3 border-b border-[#eaeaea] flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white flex-shrink-0">
                <User size={16} />
              </div>
              <div>
                <p className="font-montserrat font-bold text-sm text-[#1a1a1a]">{sohbet.isim || sohbet.telNo}</p>
                <p className="text-xs text-[#999]">{sohbet.telNo}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#f8f9fa]">
              {sohbet.mesajlar.map((m: any) => (
                <div key={m.id} className={`flex ${m.yon === 'giden' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm font-montserrat ${
                      m.yon === 'giden' ? 'bg-[#1a1a1a] text-white' : 'bg-white border border-[#eaeaea] text-[#1a1a1a]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.icerik}</p>
                    <p className={`text-[10px] mt-1 ${m.yon === 'giden' ? 'text-gray-400' : 'text-[#999]'}`}>{formatDate(m.createdAt)}</p>
                  </div>
                </div>
              ))}
              <div ref={mesajSonuRef} />
            </div>

            <div className="px-5 py-3 border-t border-[#eaeaea]">
              {hata && <p className="text-xs text-red-500 font-montserrat mb-2">{hata}</p>}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={yeniMesaj}
                  onChange={e => setYeniMesaj(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') gonder() }}
                  placeholder="Mesaj yaz..."
                  className="flex-1 border border-[#eaeaea] rounded-full px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                />
                <button
                  onClick={gonder}
                  disabled={gonderiliyor || !yeniMesaj.trim()}
                  className="bg-[#1a1a1a] text-white rounded-full w-11 h-11 flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-[#999] font-montserrat mt-1.5">
                WhatsApp kuralı: müşterinin son 24 saat içinde mesaj atmış olması gerekir, aksi halde serbest metin gönderilemez.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
