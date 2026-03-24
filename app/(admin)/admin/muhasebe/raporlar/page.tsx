"use client"
import { useState } from 'react'
import { Download, FileText } from 'lucide-react'

export default function RaporlarPage() {
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [raporTipi, setRaporTipi] = useState('aylik')
  const [generating, setGenerating] = useState(false)

  const generateReport = async (format: 'excel' | 'pdf', baslik?: string) => {
    setGenerating(true)
    try {
      const res = await fetch('/api/muhasebe/rapor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateFrom, dateTo, raporTipi, format }),
      })
      if (!res.ok) { alert('Rapor oluşturulamadı'); return }
      const data = await res.json()
      const baslikMetin = baslik || `Rapor ${dateFrom} - ${dateTo}`

      if (format === 'excel') {
        const XLSX = await import('xlsx')
        const wb = XLSX.utils.book_new()

        const ozetRows = [
          ['404 Dijital - Mali Rapor'],
          [`Donem: ${dateFrom} - ${dateTo}`],
          [],
          ['Toplam Gelir (TL)', data.toplamGelir],
          ['Toplam Gider (TL)', data.toplamGider],
          ['Net Kar (TL)', data.netKar],
          ['Gelir Kaydi Sayisi', data.gelirSayisi],
          ['Gider Kaydi Sayisi', data.giderSayisi],
        ]
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ozetRows), 'Ozet')

        if (data.gelirler?.length > 0) {
          const rows = [
            ['Tarih', 'Musteri', 'Gelir Turu', 'Aciklama', 'Tutar', 'KDV', 'Net Tutar', 'Durum'],
            ...data.gelirler.map((g: any) => [
              new Date(g.tarih).toLocaleDateString('tr-TR'),
              g.musteriAdi || g.musteri?.firmaAdi || '-',
              g.gelirTuru || '-',
              g.aciklama || '-',
              g.tutar,
              g.kdvOrani ? `%${g.kdvOrani}` : '-',
              g.netTutar,
              g.tahsilatDurumu || '-',
            ])
          ]
          XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Gelirler')
        }

        if (data.giderler?.length > 0) {
          const rows = [
            ['Tarih', 'Kategori', 'Aciklama', 'Tutar', 'KDV', 'Net Tutar', 'Durum'],
            ...data.giderler.map((g: any) => [
              new Date(g.tarih).toLocaleDateString('tr-TR'),
              g.kategori || '-',
              g.aciklama || '-',
              g.tutar,
              g.kdvOrani ? `%${g.kdvOrani}` : '-',
              g.netTutar,
              g.odemeDurumu || '-',
            ])
          ]
          XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Giderler')
        }

        XLSX.writeFile(wb, `rapor-${dateFrom}-${dateTo}.xlsx`)

      } else {
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF()
        let y = 20

        doc.setFontSize(18)
        doc.text('404 Dijital - Mali Rapor', 14, y); y += 10
        doc.setFontSize(11)
        doc.text(`Donem: ${dateFrom} - ${dateTo}`, 14, y); y += 8
        doc.text(`Rapor: ${baslikMetin}`, 14, y); y += 14

        doc.setFontSize(13)
        doc.text('Ozet', 14, y); y += 8
        doc.setFontSize(11)
        doc.text(`Toplam Gelir: ${data.toplamGelir.toLocaleString('tr-TR')} TL`, 14, y); y += 7
        doc.text(`Toplam Gider: ${data.toplamGider.toLocaleString('tr-TR')} TL`, 14, y); y += 7
        doc.text(`Net Kar: ${data.netKar.toLocaleString('tr-TR')} TL`, 14, y); y += 7
        doc.text(`Gelir Kaydi: ${data.gelirSayisi} adet   Gider Kaydi: ${data.giderSayisi} adet`, 14, y); y += 14

        if (data.gelirler?.length > 0) {
          doc.setFontSize(13)
          doc.text('Gelirler', 14, y); y += 8
          doc.setFontSize(9)
          data.gelirler.slice(0, 40).forEach((g: any) => {
            if (y > 270) { doc.addPage(); y = 20 }
            const tarih = new Date(g.tarih).toLocaleDateString('tr-TR')
            const musteri = (g.musteriAdi || '-').substring(0, 18)
            doc.text(`${tarih}  ${musteri}  ${g.netTutar.toLocaleString('tr-TR')} TL  ${g.tahsilatDurumu || ''}`, 14, y)
            y += 6
          })
          y += 4
        }

        if (data.giderler?.length > 0) {
          if (y > 240) { doc.addPage(); y = 20 }
          doc.setFontSize(13)
          doc.text('Giderler', 14, y); y += 8
          doc.setFontSize(9)
          data.giderler.slice(0, 40).forEach((g: any) => {
            if (y > 270) { doc.addPage(); y = 20 }
            const tarih = new Date(g.tarih).toLocaleDateString('tr-TR')
            const kat = (g.kategori || '-').substring(0, 18)
            doc.text(`${tarih}  ${kat}  ${g.netTutar.toLocaleString('tr-TR')} TL  ${g.odemeDurumu || ''}`, 14, y)
            y += 6
          })
        }

        doc.save(`rapor-${dateFrom}-${dateTo}.pdf`)
      }
    } catch {
      alert('Rapor olusturulurken hata olustu')
    } finally {
      setGenerating(false)
    }
  }

  const HAZIR_RAPORLAR = [
    { title: 'Aylık Mali Rapor', desc: 'Seçilen aya ait gelir-gider özeti', icon: '📊', tipi: 'aylik' },
    { title: 'Yıllık Mali Rapor', desc: 'Aylık karşılaştırmalı yıllık özet', icon: '📈', tipi: 'detayli' },
    { title: 'Müşteri Karlılık Raporu', desc: 'Her müşteriden elde edilen net gelir', icon: '👥', tipi: 'musteri' },
    { title: 'KDV Raporu', desc: 'Aylık/üç aylık KDV özeti', icon: '🧾', tipi: 'kategori' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider">RAPORLAR</h2>

      <div>
        <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a] mb-4">HAZIR RAPOR ŞABLONLARI</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {HAZIR_RAPORLAR.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#eaeaea] p-6 hover:border-[#1a1a1a] transition-colors">
              <div className="text-3xl mb-3">{r.icon}</div>
              <h4 className="font-montserrat font-bold text-sm text-[#1a1a1a] mb-1">{r.title}</h4>
              <p className="text-[#999] text-xs font-montserrat mb-4">{r.desc}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setRaporTipi(r.tipi); generateReport('excel', r.title) }}
                  disabled={generating}
                  className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white rounded-lg py-2 text-xs font-montserrat font-bold hover:bg-green-600 transition-colors disabled:opacity-60"
                >
                  <Download size={12} /> Excel
                </button>
                <button
                  onClick={() => { setRaporTipi(r.tipi); generateReport('pdf', r.title) }}
                  disabled={generating}
                  className="flex-1 flex items-center justify-center gap-1 bg-[#1a1a1a] text-white rounded-lg py-2 text-xs font-montserrat font-bold hover:bg-[#333] transition-colors disabled:opacity-60"
                >
                  <FileText size={12} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
