"use client"
import { useState, useEffect } from 'react'
import { Check, X, Edit, MessageSquare } from 'lucide-react'

export default function WPOnayPage() {
  const [mesajlar, setMesajlar] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMesajlar() }, [])

  const fetchMesajlar = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/muhasebe/onay-bekleyen')
      const data = await res.json()
      setMesajlar(data || [])
    } catch {
      setMesajlar([
        { id: '1', mesaj: 'GİDER 500 TL kırtasiye', telNo: '+905446844067', tarih: new Date().toISOString(), islemTipi: 'GIDER', tutar: 500, kategori: 'Ofis Giderleri', aciklama: 'kırtasiye', durum: 'bekliyor' },
        { id: '2', mesaj: 'GİDER 1500 TL reklam meta', telNo: '+905446844067', tarih: new Date().toISOString(), islemTipi: 'GIDER', tutar: 1500, kategori: 'Reklam Bütçesi', aciklama: 'reklam meta', durum: 'bekliyor' },
        { id: '3', mesaj: 'GELİR 5000 TL Firma A', telNo: '+905446844067', tarih: new Date().toISOString(), islemTipi: 'GELIR', tutar: 5000, kategori: 'Diğer', aciklama: 'Firma A', durum: 'bekliyor' },
      ])
    } finally { setLoading(false) }
  }

  const handleAction = async (id: string, action: 'onayla' | 'reddet') => {
    await fetch('/api/muhasebe/onay-bekleyen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    }).catch(() => {})
    setMesajlar(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider">WHATSAPP ONAY BEKLEYENLERİ</h2>
        <p className="text-[#555] font-montserrat text-sm mt-1">WhatsApp'tan gelen harcama/gelir bildirimleri</p>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <MessageSquare size={20} className="text-[#25D366]" />
          <h3 className="font-bebas text-xl tracking-wider">WHATSAPP MESAJ FORMATI</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-sm">
          {['GİDER 500 TL kırtasiye', 'GİDER 1500 TL reklam meta', 'GELİR 5000 TL Firma A'].map((ex, i) => (
            <div key={i} className="bg-white/10 rounded-lg px-4 py-2.5 text-[#ffc107]">{ex}</div>
          ))}
        </div>
        <p className="text-gray-400 text-xs mt-2 font-montserrat">+90 544 684 40 67 numarasına gönderin</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#999] font-montserrat">Yükleniyor...</div>
      ) : mesajlar.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">✅</div>
          <p className="font-bebas text-2xl text-[#1a1a1a] tracking-wider">ONAY BEKLEYEN YOK</p>
          <p className="text-[#555] font-montserrat text-sm mt-2">Tüm mesajlar işlendi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mesajlar.map(m => (
            <div key={m.id} className="bg-white rounded-2xl border border-[#eaeaea] p-5">
              <div className="flex flex-wrap gap-4 items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.islemTipi === 'GIDER' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {m.islemTipi === 'GIDER' ? '📉 GİDER' : '💰 GELİR'}
                    </span>
                    <span className="font-mono text-xs text-[#999]">{new Date(m.tarih).toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="bg-[#f8f9fa] rounded-xl px-4 py-2 font-mono text-sm text-[#333] mb-3 inline-block">
                    {m.mesaj}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm font-montserrat">
                    <div><p className="text-[#999] text-xs">Tutar</p><p className="font-bold text-[#1a1a1a]">₺{(m.tutar || 0).toLocaleString('tr-TR')}</p></div>
                    <div><p className="text-[#999] text-xs">Kategori</p><p className="font-semibold text-[#1a1a1a]">{m.kategori || 'Diğer'}</p></div>
                    <div><p className="text-[#999] text-xs">Açıklama</p><p className="text-[#555]">{m.aciklama || '-'}</p></div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleAction(m.id, 'onayla')}
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-montserrat font-bold transition-colors">
                    <Check size={14} /> Onayla
                  </button>
                  <button onClick={() => handleAction(m.id, 'reddet')}
                    className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-montserrat font-bold transition-colors">
                    <X size={14} /> Reddet
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
