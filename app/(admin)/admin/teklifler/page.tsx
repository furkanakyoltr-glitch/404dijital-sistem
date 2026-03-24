"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ExternalLink, Clock, CheckCircle, XCircle, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const DURUM_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  bekliyor:  { label: 'Bekliyor',  color: '#f59e0b', bg: '#fffbeb', icon: Clock },
  onaylandi: { label: 'Onaylandı', color: '#22c55e', bg: '#f0fdf4', icon: CheckCircle },
  reddedildi:{ label: 'Reddedildi',color: '#ef4444', bg: '#fef2f2', icon: XCircle },
}

export default function TekliflerPage() {
  const [teklifler, setTeklifler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [durumFilter, setDurumFilter] = useState('')

  useEffect(() => {
    fetchTeklifler()
  }, [search, durumFilter])

  const fetchTeklifler = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('arama', search)
    if (durumFilter) params.set('durum', durumFilter)
    try {
      const res = await fetch(`/api/teklifler?${params}`)
      const data = await res.json()
      setTeklifler(data.data || [])
    } catch {
      setTeklifler([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider">TEKLİFLER</h2>
        <Link href="/admin/teklif-olustur" className="btn-primary text-sm">+ YENİ TEKLİF</Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] w-4 h-4" />
          <input
            type="text"
            placeholder="Firma adı veya teklif no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-[#eaeaea] rounded-xl text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
          />
        </div>
        <select
          value={durumFilter}
          onChange={e => setDurumFilter(e.target.value)}
          className="border border-[#eaeaea] rounded-xl px-3 py-2.5 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
        >
          <option value="">Tüm Durumlar</option>
          <option value="bekliyor">Bekliyor</option>
          <option value="onaylandi">Onaylandı</option>
          <option value="reddedildi">Reddedildi</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-[#eaeaea] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-montserrat">
            <thead>
              <tr className="border-b border-[#eaeaea] bg-[#f8f9fa]">
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Teklif No</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Firma</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Paket</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Tutar</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Durum</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Tarih</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-[#999]">Yükleniyor...</td></tr>
              ) : teklifler.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-[#999]">Teklif bulunamadı</td></tr>
              ) : (
                teklifler.map(t => {
                  const cfg = DURUM_CONFIG[t.durum] || DURUM_CONFIG['bekliyor']
                  const Icon = cfg.icon
                  return (
                    <tr key={t.id} className="border-b border-[#f0f0f0] hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#555]">#{t.teklifNo}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-[#1a1a1a]">{t.musteri?.firmaAdi || t.teklifNo}</p>
                          <p className="text-xs text-[#999]">{t.musteri?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#555] text-xs">{t.paketAdi}</td>
                      <td className="px-4 py-3 font-semibold text-[#1a1a1a]">₺{t.toplam?.toLocaleString('tr-TR')}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ color: cfg.color, background: cfg.bg }}>
                          <Icon size={12} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#999] text-xs">{formatDate(t.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {t.musteri && (
                            <Link href={`/admin/musteriler/${t.musteriId}`} className="p-1.5 hover:bg-[#f0f0f0] rounded-lg transition-colors" title="Müşteri Detay">
                              <Eye size={14} className="text-[#555]" />
                            </Link>
                          )}
                          <a
                            href={`https://teklif.404dijital.com/${t.teklifNo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-[#f0f0f0] rounded-lg transition-colors"
                            title="Teklifi Görüntüle"
                          >
                            <ExternalLink size={14} className="text-[#555]" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
