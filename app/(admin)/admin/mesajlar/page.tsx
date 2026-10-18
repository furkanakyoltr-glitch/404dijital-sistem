"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, MessageCircle, User, Paperclip, FileText, X, Sparkles, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function MesajlarPage() {
  const [sohbetler, setSohbetler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [seciliId, setSeciliId] = useState<string | null>(null)
  const [sohbet, setSohbet] = useState<any | null>(null)
  const [yeniMesaj, setYeniMesaj] = useState('')
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [hata, setHata] = useState('')
  const [seciliDosya, setSeciliDosya] = useState<File | null>(null)
  const [aiAcik, setAiAcik] = useState(false)
  const [aiYukleniyor, setAiYukleniyor] = useState(false)
  const [aiOzet, setAiOzet] = useState('')
  const [aiHata, setAiHata] = useState('')
  const mesajSonuRef = useRef<HTMLDivElement>(null)
  const dosyaInputRef = useRef<HTMLInputElement>(null)

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

  const aiAnalizYap = async () => {
    setAiAcik(true)
    setAiYukleniyor(true)
    setAiHata('')
    setAiOzet('')
    try {
      const res = await fetch('/api/whatsapp/ai-analiz')
      const data = await res.json()
      if (data.error) setAiHata(data.error)
      else setAiOzet(data.ozet)
    } catch {
      setAiHata('Bağlantı hatası')
    } finally {
      setAiYukleniyor(false)
    }
  }

  const dosyaSecildi = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dosya = e.target.files?.[0]
    if (dosya) setSeciliDosya(dosya)
    e.target.value = ''
  }

  const gonder = async () => {
    if (!seciliId) return
    const icerik = yeniMesaj.trim()
    if (!icerik && !seciliDosya) return
    setGonderiliyor(true)
    setHata('')
    try {
      let res: Response
      if (seciliDosya) {
        const form = new FormData()
        form.append('sohbetId', seciliId)
        form.append('dosya', seciliDosya)
        if (icerik) form.append('caption', icerik)
        res = await fetch('/api/whatsapp/gonder-medya', { method: 'POST', body: form })
      } else {
        res = await fetch('/api/whatsapp/gonder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sohbetId: seciliId, icerik }),
        })
      }
      const data = await res.json()
      if (data.success) {
        setSohbet((prev: any) => ({ ...prev, mesajlar: [...prev.mesajlar, data.mesaj] }))
        setYeniMesaj('')
        setSeciliDosya(null)
        fetchSohbetler()
      } else {
        setHata(data.error || 'Gönderilemedi')
      }
    } finally {
      setGonderiliyor(false)
    }
  }

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-2xl border border-[#eaeaea] overflow-hidden relative">
      {aiAcik && (
        <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center p-6" onClick={() => setAiAcik(false)}>
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bebas text-lg tracking-wider text-[#1a1a1a] flex items-center gap-2">
                <Sparkles size={16} /> AI İÇGÖRÜ (SON 30 GÜN)
              </h3>
              <button onClick={() => setAiAcik(false)} className="text-[#999] hover:text-[#1a1a1a]">
                <X size={16} />
              </button>
            </div>
            {aiYukleniyor ? (
              <div className="flex items-center justify-center py-10 text-[#999]">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : aiHata ? (
              <p className="text-sm text-red-500 font-montserrat">{aiHata}</p>
            ) : (
              <p className="text-sm font-montserrat text-[#333] whitespace-pre-wrap">{aiOzet}</p>
            )}
          </div>
        </div>
      )}
      {/* Sohbet Listesi */}
      <div className="w-80 border-r border-[#eaeaea] flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-[#eaeaea] flex items-center justify-between gap-2">
          <h2 className="font-bebas text-xl tracking-wider text-[#1a1a1a] flex items-center gap-2">
            <MessageCircle size={18} /> MESAJLAR
          </h2>
          <button
            onClick={aiAnalizYap}
            title="AI İçgörü: son 30 günün mesajlarını analiz et"
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full border border-[#eaeaea] text-[#666] hover:bg-[#f8f9fa] transition-colors"
          >
            <Sparkles size={15} />
          </button>
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
                    {m.medyaTipi && m.yon === 'gelen' && m.waMedyaId && (
                      <div className={`mb-1 ${m.icerik ? 'pb-2 border-b border-[#eaeaea]' : ''}`}>
                        {m.medyaTipi === 'image' ? (
                          <a href={`/api/whatsapp/medya/${m.id}`} target="_blank" rel="noopener noreferrer">
                            <img
                              src={`/api/whatsapp/medya/${m.id}`}
                              alt={m.medyaAdi || 'Görsel'}
                              className="max-w-full rounded-lg max-h-64 object-contain border border-[#eaeaea]"
                            />
                          </a>
                        ) : (
                          <a
                            href={`/api/whatsapp/medya/${m.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[#1a1a1a] hover:underline"
                          >
                            <FileText size={15} className="flex-shrink-0" />
                            <span className="text-xs truncate">{m.medyaAdi || 'Dosya'}</span>
                          </a>
                        )}
                      </div>
                    )}
                    {m.medyaTipi && !(m.yon === 'gelen' && m.waMedyaId) && (
                      <div className={`flex items-center gap-2 mb-1 ${m.icerik ? 'pb-2 border-b border-white/15' : ''}`}>
                        {m.medyaTipi === 'image' ? (
                          <span className="text-base">📷</span>
                        ) : (
                          <FileText size={15} className="flex-shrink-0" />
                        )}
                        <span className="text-xs opacity-80 truncate">{m.medyaAdi || 'Dosya'}</span>
                      </div>
                    )}
                    {m.icerik && <p className="whitespace-pre-wrap">{m.icerik}</p>}
                    <p className={`text-[10px] mt-1 ${m.yon === 'giden' ? 'text-gray-400' : 'text-[#999]'}`}>{formatDate(m.createdAt)}</p>
                  </div>
                </div>
              ))}
              <div ref={mesajSonuRef} />
            </div>

            <div className="px-5 py-3 border-t border-[#eaeaea]">
              {hata && <p className="text-xs text-red-500 font-montserrat mb-2">{hata}</p>}
              {seciliDosya && (
                <div className="flex items-center gap-2 bg-[#f8f9fa] border border-[#eaeaea] rounded-lg px-3 py-2 mb-2 text-xs font-montserrat">
                  <FileText size={14} className="flex-shrink-0 text-[#666]" />
                  <span className="flex-1 truncate text-[#1a1a1a]">{seciliDosya.name}</span>
                  <button onClick={() => setSeciliDosya(null)} className="text-[#999] hover:text-[#1a1a1a]">
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input ref={dosyaInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={dosyaSecildi} />
                <button
                  onClick={() => dosyaInputRef.current?.click()}
                  title="PDF veya görsel ekle"
                  className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full border border-[#eaeaea] text-[#666] hover:bg-[#f8f9fa] transition-colors"
                >
                  <Paperclip size={16} />
                </button>
                <input
                  type="text"
                  value={yeniMesaj}
                  onChange={e => setYeniMesaj(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') gonder() }}
                  placeholder={seciliDosya ? 'Dosya için açıklama (opsiyonel)...' : 'Mesaj yaz...'}
                  className="flex-1 border border-[#eaeaea] rounded-full px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                />
                <button
                  onClick={gonder}
                  disabled={gonderiliyor || (!yeniMesaj.trim() && !seciliDosya)}
                  className="bg-[#1a1a1a] text-white rounded-full w-11 h-11 flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-[#999] font-montserrat mt-1.5">
                WhatsApp kuralı: müşterinin son 24 saat içinde mesaj atmış olması gerekir, aksi halde serbest metin/dosya gönderilemez. PDF ve görsel ekleyebilirsin (maks. 15MB).
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
