"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Download, Filter, Paperclip, Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const DURUM_BADGE: Record<string, any> = {
  'Tahsil Edildi': 'success',
  'Beklemede': 'warning',
  'Kısmi Tahsilat': 'info',
}

export default function GelirPage() {
  const [gelirler, setGelirler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [durumFilter, setDurumFilter] = useState('')

  useEffect(() => { fetchGelirler() }, [search, durumFilter])

  const fetchGelirler = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('arama', search)
      if (durumFilter) params.set('durum', durumFilter)
      const res = await fetch(`/api/muhasebe/gelir?${params}`)
      const data = await res.json()
      setGelirler(data.data || [])
    } catch {
      setGelirler([
        { id: '1', tarih: '2026-03-15', musteriAdi: 'Firma A', gelirTuru: 'Paket', aciklama: 'Gold paket', tutar: 50000, kdvOrani: 20, netTutar: 60000, tahsilatDurumu: 'Tahsil Edildi', dekontUrl: null },
        { id: '2', tarih: '2026-03-14', musteriAdi: 'Firma B', gelirTuru: 'Danışmanlık', aciklama: 'Strateji görüşmesi', tutar: 5000, kdvOrani: 20, netTutar: 6000, tahsilatDurumu: 'Beklemede', dekontUrl: null },
      ])
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return
    await fetch(`/api/muhasebe/gelir?id=${id}`, { method: 'DELETE' })
    fetchGelirler()
  }

  const exportCSV = () => {
    const headers = ['Tarih', 'Müşteri', 'Tür', 'Açıklama', 'Tutar', 'KDV', 'Net', 'Durum']
    const rows = gelirler.map(g => [g.tarih, g.musteriAdi || '', g.gelirTuru, g.aciklama || '', g.tutar, g.kdvOrani, g.netTutar, g.tahsilatDurumu])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'gelirler.csv'; a.click()
  }

  const toplamGelir = gelirler.reduce((s, g) => s + (g.netTutar || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider">GELİR LİSTESİ</h2>
          <p className="text-[#555] font-montserrat text-sm">Toplam: <strong className="text-green-600">₺{toplamGelir.toLocaleString('tr-TR')}</strong></p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat font-semibold hover:border-[#1a1a1a] transition-colors">
            <Download size={14} /> CSV
          </button>
          <Link href="/admin/muhasebe/gelir/ekle" className="btn-primary text-sm flex items-center gap-1.5">
            <Plus size={14} /> GELİR EKLE
          </Link>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] w-4 h-4" />
          <input type="text" placeholder="Ara..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-[#eaeaea] rounded-xl text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
        </div>
        <select value={durumFilter} onChange={e => setDurumFilter(e.target.value)}
          className="border border-[#eaeaea] rounded-xl px-3 py-2.5 text-sm font-montserrat focus:outline-none">
          <option value="">Tüm Durumlar</option>
          <option>Tahsil Edildi</option><option>Beklemede</option><option>Kısmi Tahsilat</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-[#eaeaea] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-montserrat">
            <thead>
              <tr className="border-b border-[#eaeaea] bg-[#f8f9fa]">
                {['Tarih','Müşteri','Tür','Açıklama','Tutar','KDV','Net','Durum','Fiş','İşlem'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-12 text-[#999]">Yükleniyor...</td></tr>
              ) : gelirler.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-[#999]">Kayıt bulunamadı</td></tr>
              ) : gelirler.map(g => (
                <tr key={g.id} className="border-b border-[#f0f0f0] hover:bg-[#f8f9fa]">
                  <td className="px-4 py-3 text-[#555] text-xs font-mono">{new Date(g.tarih).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3 font-semibold text-[#1a1a1a]">{g.musteriAdi || g.musteri?.firmaAdi || '-'}</td>
                  <td className="px-4 py-3 text-[#555]">{g.gelirTuru}</td>
                  <td className="px-4 py-3 text-[#555] max-w-xs truncate">{g.aciklama || '-'}</td>
                  <td className="px-4 py-3 text-[#555]">₺{(g.tutar || 0).toLocaleString('tr-TR')}</td>
                  <td className="px-4 py-3 text-[#555]">%{g.kdvOrani}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">₺{(g.netTutar || 0).toLocaleString('tr-TR')}</td>
                  <td className="px-4 py-3"><Badge variant={DURUM_BADGE[g.tahsilatDurumu] || 'outline'}>{g.tahsilatDurumu}</Badge></td>
                  <td className="px-4 py-3">{g.dekontUrl ? <a href={g.dekontUrl} target="_blank" className="text-[#3b82f6] hover:underline"><Paperclip size={14} /></a> : <span className="text-[#ccc]">-</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link href={`/admin/muhasebe/gelir/${g.id}`} className="p-1.5 hover:bg-[#f0f0f0] rounded-lg"><Edit size={14} className="text-[#555]" /></Link>
                      <button onClick={() => handleDelete(g.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-red-400" /></button>
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
