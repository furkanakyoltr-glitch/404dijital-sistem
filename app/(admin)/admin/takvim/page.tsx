"use client"
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

const AYLAR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
const GUNLER = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz']

const DEMO_EVENTS = [
  { date: '2026-03-21', title: 'ABC Şirketi - Toplantı', color: '#3b82f6' },
  { date: '2026-03-24', title: 'XYZ Teslim Tarihi', color: '#ef4444' },
  { date: '2026-03-28', title: 'Rapor Hazırlama', color: '#22c55e' },
  { date: '2026-03-25', title: 'Reklam Yayını', color: '#f59e0b' },
]

export default function TakvimPage() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [view, setView] = useState<'month'|'week'>('month')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1

  const prev = () => setCurrentDate(new Date(year, month - 1, 1))
  const next = () => setCurrentDate(new Date(year, month + 1, 1))

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return DEMO_EVENTS.filter(e => e.date === dateStr)
  }

  const isToday = (day: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider">TAKVİM</h2>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-[#eaeaea] rounded-xl overflow-hidden">
            {(['month','week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-2 text-sm font-montserrat font-semibold transition-colors ${view === v ? 'bg-[#1a1a1a] text-white' : 'text-[#555] hover:bg-[#f8f9fa]'}`}>
                {v === 'month' ? 'Aylık' : 'Haftalık'}
              </button>
            ))}
          </div>
          <button className="btn-primary text-sm flex items-center gap-1.5"><Plus size={14} /> ETKİNLİK EKLE</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#eaeaea] overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eaeaea]">
          <button onClick={prev} className="p-2 hover:bg-[#f8f9fa] rounded-xl"><ChevronLeft size={18} /></button>
          <h3 className="font-bebas text-2xl tracking-wider text-[#1a1a1a]">
            {AYLAR[month]} {year}
          </h3>
          <button onClick={next} className="p-2 hover:bg-[#f8f9fa] rounded-xl"><ChevronRight size={18} /></button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-[#eaeaea]">
          {GUNLER.map(g => (
            <div key={g} className="text-center py-3 text-xs font-montserrat font-bold text-[#999] uppercase">{g}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: startOffset }, (_, i) => (
            <div key={`empty-${i}`} className="h-28 border-b border-r border-[#f0f0f0] bg-[#fafafa]"></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const events = getEventsForDate(day)
            const isTodayDay = isToday(day)
            return (
              <div key={day} className={`h-28 border-b border-r border-[#f0f0f0] p-2 hover:bg-[#f8f9fa] transition-colors ${isTodayDay ? 'bg-blue-50' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-montserrat font-bold mb-1 ${isTodayDay ? 'bg-[#1a1a1a] text-white' : 'text-[#555]'}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {events.slice(0, 2).map((event, ei) => (
                    <div key={ei} className="text-xs font-montserrat px-1.5 py-0.5 rounded text-white truncate" style={{ background: event.color }}>
                      {event.title}
                    </div>
                  ))}
                  {events.length > 2 && <div className="text-xs text-[#999] font-montserrat">+{events.length - 2} daha</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
        <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a] mb-4">YAKLAŞAN ETKİNLİKLER</h3>
        <div className="space-y-2">
          {DEMO_EVENTS.sort((a, b) => a.date.localeCompare(b.date)).map((event, i) => (
            <div key={i} className="flex items-center gap-3 p-3 hover:bg-[#f8f9fa] rounded-xl transition-colors">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: event.color }}></div>
              <div className="flex-1">
                <p className="text-sm font-montserrat font-semibold text-[#1a1a1a]">{event.title}</p>
              </div>
              <span className="text-xs font-mono text-[#999]">{new Date(event.date).toLocaleDateString('tr-TR')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
