"use client"
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Phone } from 'lucide-react'

const AYLAR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
const GUNLER = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz']

type Randevu = { id: string; tarih: string; saat: string; adaySoyad: string; telefon: string; pozisyon: string }

export default function TakvimPage() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [randevular, setRandevular] = useState<Randevu[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/randevu')
      .then(res => res.json())
      .then(data => setRandevular(data.randevular || []))
      .finally(() => setLoading(false))
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1

  const prev = () => setCurrentDate(new Date(year, month - 1, 1))
  const next = () => setCurrentDate(new Date(year, month + 1, 1))

  const getRandevularForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return randevular.filter(r => r.tarih === dateStr)
  }

  const isToday = (day: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const siraliRandevular = [...randevular].sort((a, b) => (a.tarih + a.saat).localeCompare(b.tarih + b.saat))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider">TAKVİM</h2>
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
            const gunRandevulari = getRandevularForDate(day)
            const isTodayDay = isToday(day)
            return (
              <div key={day} className={`h-28 border-b border-r border-[#f0f0f0] p-2 hover:bg-[#f8f9fa] transition-colors overflow-hidden ${isTodayDay ? 'bg-blue-50' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-montserrat font-bold mb-1 ${isTodayDay ? 'bg-[#1a1a1a] text-white' : 'text-[#555]'}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {gunRandevulari.slice(0, 2).map((r) => (
                    <div key={r.id} className="text-[10px] font-montserrat px-1.5 py-0.5 rounded text-white truncate bg-[#1a1a1a]">
                      {r.saat} {r.adaySoyad}
                    </div>
                  ))}
                  {gunRandevulari.length > 2 && <div className="text-[10px] text-[#999] font-montserrat">+{gunRandevulari.length - 2} daha</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
        <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a] mb-4">MÜLAKAT RANDEVULARI</h3>
        {loading ? (
          <p className="text-sm text-[#999] font-montserrat">Yükleniyor...</p>
        ) : siraliRandevular.length === 0 ? (
          <p className="text-sm text-[#999] font-montserrat">Henüz randevu alınmadı.</p>
        ) : (
          <div className="space-y-2">
            {siraliRandevular.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 hover:bg-[#f8f9fa] rounded-xl transition-colors">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-[#1a1a1a]"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-montserrat font-semibold text-[#1a1a1a] truncate">{r.adaySoyad} — {r.pozisyon}</p>
                  <p className="text-xs text-[#999] font-montserrat flex items-center gap-1">
                    <Phone size={10} /> {r.telefon}
                  </p>
                </div>
                <span className="text-xs font-mono text-[#999] flex-shrink-0">
                  {new Date(r.tarih).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })} · {r.saat}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
