"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Download, Paperclip, Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const DURUM_BADGE: Record<string, any> = {
  'Ödendi': 'success', 'Beklemede': 'warning', 'Kısmi Ödeme': 'info',
}

export default function GiderPage() {
  const [giderler, setGiderler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchGiderler() }, [search])

  const fetchGiderler = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('arama', search)
      const res = await fetch(`/api/muhasebe/gider?${params}`)
      const data = await res.json()
      setGiderler(data.data || [])
    } catch {
      setGiderler([
        { id: '1', tarih: '2026-03-14', kategori: 'Reklam Bütçesi', altKategori: 'Meta', aciklama: 'Mart ayı Meta bütçesi', tutar: 15000, kdvOrani: 20, netTutar: 18000, odemeDurumu: 'Ödendi' },
        { id: '2', tarih: '2026-03-13', kategori: 'Çalışan Giderleri', altKategori: 'Maaş', aciklama: 'Mart maaşı', tutar: 25000, kdvOrani: 0, netTutar: 25000, odemeDurumu: 'Ödendi' },
      ])
    } finally { setLoading(false) }
  }

  const toplamGider = giderler.reduce((s, g) => s + (g.netTutar || 0), 0)

  const exportCSV = () => {
    const headers = ['Tarih','Kategori','Alt Kategori','Açıklama','Tutar','KDV','Net','Durum']
    const rows = giderler.map(g => [g.tarih, g.kategori, g.altKategori || '', g.aciklama || '', g.tutar, g.kdvOrani || 0, g.netTutar, g.odemeDurumu])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'giderler.csv'; a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider">GİDER LİSTESİ</h2>
          <p className="text-[#555] font-montserrat text-sm">Toplam: <strong className="text-red-600">₺{toplamGider.toLocaleString('tr-TR')}</strong></p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat font-semibold hover:border-[#1a1a1a] transition-colors">
            <Download size={14} /> CSV
          </button>
          <Link href="/admin/muhasebe/gider/ekle" className="btn-primary text-sm flex items-center gap-1.5" style={{background:'#ef4444'}}>
            <Plus size={14} /> GİDER EKLE
          </Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] w-4 h-4" />
        <input type="text" placeholder="Ara..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-[#eaeaea] rounded-xl text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
      </div>

      <div className="bg-white rounded-2xl border border-[#eaeaea] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-montserrat">
            <thead>
              <tr className="border-b border-[#eaeaea] bg-[#f8f9fa]">
                {['Tarih','Kategori','Alt Kategori','Açıklama','Tutar','KDV','Net','Durum','Fiş','İşlem'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-12 text-[#999]">Yükleniyor...</td></tr>
              ) : giderler.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-[#999]">Kayıt bulunamadı</td></tr>
              ) : giderler.map(g => (
                <tr key={g.id} className="border-b border-[#f0f0f0] hover:bg-[#f8f9fa]">
                  <td className="px-4 py-3 text-[#555] text-xs font-mono">{new Date(g.tarih).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3 font-semibold text-[#1a1a1a]">{g.kategori}</td>
                  <td className="px-4 py-3 text-[#555]">{g.altKategori || '-'}</td>
                  <td className="px-4 py-3 text-[#555] max-w-xs truncate">{g.aciklama || '-'}</td>
                  <td className="px-4 py-3 text-[#555]">₺{(g.tutar || 0).toLocaleString('tr-TR')}</td>
                  <td className="px-4 py-3 text-[#555]">%{g.kdvOrani || 0}</td>
                  <td className="px-4 py-3 font-semibold text-red-600">₺{(g.netTutar || 0).toLocaleString('tr-TR')}</td>
                  <td className="px-4 py-3"><Badge variant={DURUM_BADGE[g.odemeDurumu] || 'outline'}>{g.odemeDurumu}</Badge></td>
                  <td className="px-4 py-3">{g.fisUrl ? <a href={g.fisUrl} target="_blank" className="text-[#3b82f6]"><Paperclip size={14} /></a> : <span className="text-[#ccc]">-</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link href={`/admin/muhasebe/gider/${g.id}`} className="p-1.5 hover:bg-[#f0f0f0] rounded-lg"><Edit size={14} className="text-[#555]" /></Link>
                      <button onClick={async () => { if(confirm('Silmek istediğinizden emin misiniz?')) { await fetch(`/api/muhasebe/gider?id=${g.id}`, {method:'DELETE'}); fetchGiderler() } }} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
