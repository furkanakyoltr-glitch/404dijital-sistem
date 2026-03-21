"use client"
import { useState, useEffect } from 'react'
import { Plus, X, GripVertical, Calendar, Tag } from 'lucide-react'

interface KanbanKart {
  id: string
  baslik: string
  aciklama?: string
  sutun: string
  etiket?: string
  sonTarih?: string
  sira: number
}

const SUTUNLAR = [
  { id: 'yapilacak', label: '🟡 Yapılacak', color: '#f59e0b' },
  { id: 'devam', label: '🔵 Devam Ediyor', color: '#3b82f6' },
  { id: 'kontrol', label: '🟣 Kontrol', color: '#8b5cf6' },
  { id: 'tamamlandi', label: '✅ Tamamlandı', color: '#22c55e' },
]

const ETIKET_RENK: Record<string, string> = {
  acil: '#ef4444', dusuk: '#94a3b8', normal: '#6b7280',
  tasarim: '#8b5cf6', metin: '#3b82f6', strateji: '#f59e0b',
}

export function KanbanBoard({ musteriId }: { musteriId: string }) {
  const [kartlar, setKartlar] = useState<KanbanKart[]>([])
  const [yeniKart, setYeniKart] = useState<{ sutun: string; baslik: string } | null>(null)
  const [dragKart, setDragKart] = useState<KanbanKart | null>(null)

  useEffect(() => {
    fetch(`/api/musteriler/${musteriId}/kanban`)
      .then(r => r.json())
      .then(setKartlar)
      .catch(() => setKartlar([
        { id: '1', baslik: 'Meta reklam seti oluştur', sutun: 'yapilacak', etiket: 'strateji', sira: 0 },
        { id: '2', baslik: '8 Reels videosu planla', sutun: 'devam', etiket: 'tasarim', sira: 0 },
        { id: '3', baslik: 'Aylık rapor hazırla', sutun: 'kontrol', etiket: 'normal', sira: 0 },
        { id: '4', baslik: 'Rakip analizi tamamlandı', sutun: 'tamamlandi', etiket: 'strateji', sira: 0 },
      ]))
  }, [musteriId])

  const handleDragStart = (kart: KanbanKart) => setDragKart(kart)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = async (sutun: string) => {
    if (!dragKart || dragKart.sutun === sutun) return
    const updated = kartlar.map(k => k.id === dragKart.id ? { ...k, sutun } : k)
    setKartlar(updated)
    setDragKart(null)
    await fetch(`/api/musteriler/${musteriId}/kanban`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: dragKart.id, sutun }),
    }).catch(() => {})
  }

  const addKart = async (sutun: string, baslik: string) => {
    if (!baslik.trim()) return
    const newKart: KanbanKart = { id: Date.now().toString(), baslik, sutun, sira: 0 }
    setKartlar(prev => [...prev, newKart])
    setYeniKart(null)
    await fetch(`/api/musteriler/${musteriId}/kanban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baslik, sutun, musteriId }),
    }).catch(() => {})
  }

  const deleteKart = async (id: string) => {
    setKartlar(prev => prev.filter(k => k.id !== id))
    await fetch(`/api/musteriler/${musteriId}/kanban?id=${id}`, { method: 'DELETE' }).catch(() => {})
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto">
      {SUTUNLAR.map(sutun => {
        const sutunKartlari = kartlar.filter(k => k.sutun === sutun.id).sort((a, b) => a.sira - b.sira)
        return (
          <div
            key={sutun.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(sutun.id)}
            className="bg-[#f8f9fa] rounded-xl p-3 min-h-64"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-montserrat font-semibold text-sm text-[#333]">{sutun.label}</h3>
              <span className="bg-white text-[#555] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border border-[#eaeaea]">
                {sutunKartlari.length}
              </span>
            </div>

            <div className="space-y-2">
              {sutunKartlari.map(kart => (
                <div
                  key={kart.id}
                  draggable
                  onDragStart={() => handleDragStart(kart)}
                  className="bg-white rounded-xl border border-[#eaeaea] p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical size={12} className="text-[#ccc] mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-montserrat text-[#333] leading-tight">{kart.baslik}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {kart.etiket && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded text-white font-semibold"
                            style={{ background: ETIKET_RENK[kart.etiket] || '#6b7280' }}
                          >
                            {kart.etiket}
                          </span>
                        )}
                        {kart.sonTarih && (
                          <span className="flex items-center gap-1 text-xs text-[#999]">
                            <Calendar size={10} />
                            {new Date(kart.sonTarih).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteKart(kart.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#f0f0f0] rounded transition-all flex-shrink-0"
                    >
                      <X size={12} className="text-[#999]" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Card */}
              {yeniKart?.sutun === sutun.id ? (
                <div className="bg-white rounded-xl border-2 border-[#1a1a1a] p-3">
                  <input
                    type="text"
                    placeholder="Görev başlığı..."
                    autoFocus
                    className="w-full text-sm font-montserrat focus:outline-none bg-transparent"
                    onKeyDown={e => {
                      if (e.key === 'Enter') addKart(sutun.id, e.currentTarget.value)
                      if (e.key === 'Escape') setYeniKart(null)
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement
                        if (input) addKart(sutun.id, input.value)
                      }}
                      className="text-xs btn-primary px-3 py-1.5 rounded-lg h-auto"
                    >
                      Ekle
                    </button>
                    <button onClick={() => setYeniKart(null)} className="text-xs text-[#999] hover:text-[#333]">İptal</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setYeniKart({ sutun: sutun.id, baslik: '' })}
                  className="w-full flex items-center gap-2 text-[#999] hover:text-[#333] text-sm font-montserrat py-2 hover:bg-white rounded-lg px-2 transition-colors"
                >
                  <Plus size={14} />
                  Kart Ekle
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
