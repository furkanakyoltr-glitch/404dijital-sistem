"use client"
import { useState } from 'react'
import { Download, FileText } from 'lucide-react'

export default function RaporlarPage() {
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [raporTipi, setRaporTipi] = useState('aylik')
  const [generating, setGenerating] = useState(false)

  const generateReport = async (format: 'excel' | 'pdf') => {
    setGenerating(true)
    try {
      const res = await fetch('/api/muhasebe/rapor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateFrom, dateTo, raporTipi, format }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rapor-${dateFrom}-${dateTo}.${format === 'excel' ? 'xlsx' : 'pdf'}`
        a.click()
      }
    } finally { setGenerating(false) }
  }

  const HAZIR_RAPORLAR = [
    { title: 'Aylık Mali Rapor', desc: 'Seçilen aya ait gelir-gider özeti', icon: '📊' },
    { title: 'Yıllık Mali Rapor', desc: 'Aylık karşılaştırmalı yıllık özet', icon: '📈' },
    { title: 'Müşteri Karlılık Raporu', desc: 'Her müşteriden elde edilen net gelir', icon: '👥' },
    { title: 'KDV Raporu', desc: 'Aylık/üç aylık KDV özeti', icon: '🧾' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider">RAPORLAR</h2>

      {/* Hazır Raporlar */}
      <div>
        <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a] mb-4">HAZIR RAPOR ŞABLONLARI</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {HAZIR_RAPORLAR.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#eaeaea] p-6 hover:border-[#1a1a1a] transition-colors cursor-pointer group">
              <div className="text-3xl mb-3">{r.icon}</div>
              <h4 className="font-montserrat font-bold text-sm text-[#1a1a1a] mb-1">{r.title}</h4>
              <p className="text-[#999] text-xs font-montserrat mb-4">{r.desc}</p>
              <div className="flex gap-2">
                <button onClick={() => generateReport('excel')} disabled={generating}
                  className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white rounded-lg py-2 text-xs font-montserrat font-bold hover:bg-green-600 transition-colors disabled:opacity-60">
                  <Download size={12} /> Excel
                </button>
                <button onClick={() => generateReport('pdf')} disabled={generating}
                  className="flex-1 flex items-center justify-center gap-1 bg-[#1a1a1a] text-white rounded-lg py-2 text-xs font-montserrat font-bold hover:bg-[#333] transition-colors disabled:opacity-60">
                  <FileText size={12} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Özel Rapor */}
      <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
        <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a] mb-6">ÖZEL RAPOR OLUŞTUR</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Başlangıç Tarihi</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Bitiş Tarihi</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Rapor Tipi</label>
            <select value={raporTipi} onChange={e => setRaporTipi(e.target.value)}
              className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]">
              <option value="aylik">Aylık Özet</option>
              <option value="detayli">Detaylı Liste</option>
              <option value="musteri">Müşteri Bazlı</option>
              <option value="kategori">Kategori Bazlı</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={() => generateReport('excel')} disabled={generating}
              className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 text-white rounded-xl py-3 text-sm font-montserrat font-bold hover:bg-green-600 transition-colors disabled:opacity-60">
              <Download size={14} /> Excel
            </button>
            <button onClick={() => generateReport('pdf')} disabled={generating}
              className="flex-1 flex items-center justify-center gap-1.5 btn-primary py-3 text-sm disabled:opacity-60">
              <FileText size={14} /> PDF
            </button>
          </div>
        </div>
        {generating && <p className="text-[#555] font-montserrat text-sm text-center">⏳ Rapor oluşturuluyor...</p>}
      </div>
    </div>
  )
}
