"use client"
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface TimelineItem {
  id: string
  baslik: string
  baslangic: string
  bitis: string
  ilerleme: number
  renk?: string
  tamamlandi: boolean
}

const RENKLER = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

export function TimelineGantt({ musteriId }: { musteriId: string }) {
  const [items, setItems] = useState<TimelineItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState({ baslik: '', baslangic: '', bitis: '', renk: RENKLER[0] })

  useEffect(() => {
    fetch(`/api/musteriler/${musteriId}/timeline`)
      .then(r => r.json())
      .then(setItems)
      .catch(() => setItems([
        { id: '1', baslik: 'Strateji', baslangic: '2026-03-01', bitis: '2026-03-07', ilerleme: 100, renk: '#3b82f6', tamamlandi: true },
        { id: '2', baslik: 'Tasarım', baslangic: '2026-03-07', bitis: '2026-03-15', ilerleme: 75, renk: '#8b5cf6', tamamlandi: false },
        { id: '3', baslik: 'Prodüksiyon', baslangic: '2026-03-10', bitis: '2026-03-25', ilerleme: 40, renk: '#f59e0b', tamamlandi: false },
        { id: '4', baslik: 'Yayın', baslangic: '2026-03-25', bitis: '2026-03-31', ilerleme: 0, renk: '#22c55e', tamamlandi: false },
      ]))
  }, [musteriId])

  const today = new Date()
  const allDates = items.flatMap(i => [new Date(i.baslangic), new Date(i.bitis)])
  const minDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date()
  const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date()
  const totalDays = Math.max((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24), 1)
  const todayOffset = Math.max(0, Math.min(100, (today.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime()) * 100))

  const getLeft = (date: string) => {
    const d = new Date(date)
    return Math.max(0, (d.getTime() - minDate.getTime()) / (totalDays * 1000 * 60 * 60 * 24) * 100)
  }
  const getWidth = (start: string, end: string) => {
    const s = new Date(start)
    const e = new Date(end)
    return Math.max(2, (e.getTime() - s.getTime()) / (totalDays * 1000 * 60 * 60 * 24) * 100)
  }

  const addItem = async () => {
    if (!newItem.baslik || !newItem.baslangic || !newItem.bitis) return
    const item: TimelineItem = { id: Date.now().toString(), ...newItem, ilerleme: 0, tamamlandi: false }
    setItems(prev => [...prev, item])
    setShowAdd(false)
    setNewItem({ baslik: '', baslangic: '', bitis: '', renk: RENKLER[0] })
    await fetch(`/api/musteriler/${musteriId}/timeline`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newItem, musteriId })
    }).catch(() => {})
  }

  return (
    <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a]">PROJE TIMELINE</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-xs flex items-center gap-1.5">
          <Plus size={14} /> AŞAMA EKLE
        </button>
      </div>

      {showAdd && (
        <div className="bg-[#f8f9fa] rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <input type="text" placeholder="Aşama adı" value={newItem.baslik} onChange={e => setNewItem(p => ({...p, baslik: e.target.value}))}
            className="col-span-2 md:col-span-1 border border-[#eaeaea] rounded-lg px-3 py-2 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
          <input type="date" value={newItem.baslangic} onChange={e => setNewItem(p => ({...p, baslangic: e.target.value}))}
            className="border border-[#eaeaea] rounded-lg px-3 py-2 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
          <input type="date" value={newItem.bitis} onChange={e => setNewItem(p => ({...p, bitis: e.target.value}))}
            className="border border-[#eaeaea] rounded-lg px-3 py-2 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
          <button onClick={addItem} className="btn-primary text-xs">EKLE</button>
        </div>
      )}

      {/* Gantt */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-32 flex-shrink-0 text-xs font-montserrat font-semibold text-[#999] uppercase tracking-wider">Aşama</div>
            <div className="flex-1 relative h-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-[#eaeaea]"></div>
              </div>
              {[0, 25, 50, 75, 100].map(pct => (
                <div key={pct} className="absolute top-0 text-xs text-[#999] font-mono -translate-x-1/2" style={{ left: `${pct}%` }}>
                  {pct}%
                </div>
              ))}
              {/* Today line */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${todayOffset}%` }} title="Bugün" />
            </div>
          </div>

          {/* Items */}
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4 mb-3">
              <div className="w-32 flex-shrink-0">
                <p className="text-sm font-montserrat font-semibold text-[#333] truncate">{item.baslik}</p>
                <p className="text-xs text-[#999]">{item.ilerleme}%</p>
              </div>
              <div className="flex-1 relative h-8 bg-[#f8f9fa] rounded-full overflow-hidden">
                {/* Background bar */}
                <div
                  className="absolute h-full rounded-full opacity-20"
                  style={{ left: `${getLeft(item.baslangic)}%`, width: `${getWidth(item.baslangic, item.bitis)}%`, background: item.renk || '#3b82f6' }}
                />
                {/* Progress bar */}
                <div
                  className="absolute h-full rounded-full flex items-center justify-end pr-2"
                  style={{
                    left: `${getLeft(item.baslangic)}%`,
                    width: `${getWidth(item.baslangic, item.bitis) * item.ilerleme / 100}%`,
                    background: item.renk || '#3b82f6',
                  }}
                />
              </div>
              <div className="w-20 flex-shrink-0 text-xs text-[#999] font-mono text-right">
                {new Date(item.bitis).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
