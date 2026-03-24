"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, Edit, BarChart2, Mail, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

const DURUM_BADGE: Record<string, any> = {
  aktif: { variant: 'success', label: 'Aktif' },
  bekliyor: { variant: 'warning', label: 'Beklemede' },
  odeme_alinacak: { variant: 'info', label: 'Ödeme Alınacak' },
  arsiv: { variant: 'outline', label: 'Arşiv' },
}

export default function MusterilerPage() {
  const [musteriler, setMusteriler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [durumFilter, setDurumFilter] = useState('')
  const [silinecek, setSilinecek] = useState<string | null>(null)
  const [silmeLoading, setSilmeLoading] = useState(false)

  useEffect(() => {
    fetchMusteriler()
  }, [search, durumFilter])

  const fetchMusteriler = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('arama', search)
    if (durumFilter) params.set('durum', durumFilter)
    try {
      const res = await fetch(`/api/musteriler?${params}`)
      const data = await res.json()
      setMusteriler(data.data || [])
    } catch {
      setMusteriler([
        { id: '1', firmaAdi: 'ABC Şirketi', kasaNo: '404-001', durum: 'aktif', telefon: '+90 555 111 22 33', email: 'abc@firma.com', teklifler: [{ paketAdi: 'Gold Paket', toplam: 60000 }], updatedAt: new Date() },
        { id: '2', firmaAdi: 'XYZ Ltd.', kasaNo: '404-002', durum: 'odeme_alinacak', telefon: '+90 555 444 55 66', email: 'xyz@firma.com', teklifler: [{ paketAdi: 'Giriş Paketi', toplam: 42000 }], updatedAt: new Date() },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSil = async (id: string) => {
    setSilmeLoading(true)
    try {
      const res = await fetch(`/api/musteriler/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMusteriler(prev => prev.filter(m => m.id !== id))
        setSilinecek(null)
      }
    } finally {
      setSilmeLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Silme Onay Modal */}
      {silinecek && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="font-bebas text-2xl tracking-wider text-[#1a1a1a] mb-2">MÜŞTERİYİ SİL</h3>
            <p className="text-[#555] font-montserrat text-sm mb-6">
              Bu müşteriyi silmek istediğine emin misin? Tüm teklif, kanban, todo ve timeline verileri de silinecek. Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleSil(silinecek)}
                disabled={silmeLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl px-6 py-3 font-montserrat font-bold text-sm transition-colors disabled:opacity-60"
              >
                {silmeLoading ? 'SİLİNİYOR...' : 'EVET, SİL'}
              </button>
              <button
                onClick={() => setSilinecek(null)}
                className="flex-1 border-2 border-[#eaeaea] text-[#555] rounded-xl px-6 py-3 font-montserrat font-bold text-sm hover:border-[#1a1a1a] transition-colors"
              >
                İPTAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] w-4 h-4" />
            <input
              type="text"
              placeholder="Müşteri ara..."
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
            <option value="aktif">Aktif</option>
            <option value="odeme_alinacak">Ödeme Alınacak</option>
            <option value="bekliyor">Beklemede</option>
            <option value="arsiv">Arşiv</option>
          </select>
        </div>
        <Link href="/admin/teklif-olustur" className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} />
          YENİ MÜŞTERİ / TEKLİF
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#eaeaea] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-montserrat">
            <thead>
              <tr className="border-b border-[#eaeaea] bg-[#f8f9fa]">
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">#</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Müşteri</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Kasa No</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Paket</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Tutar</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Durum</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Son İlet.</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-[#999]">Yükleniyor...</td></tr>
              ) : musteriler.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-[#999]">Müşteri bulunamadı</td></tr>
              ) : (
                musteriler.map((m, i) => {
                  const teklif = m.teklifler?.[0]
                  const badge = DURUM_BADGE[m.durum] || { variant: 'outline', label: m.durum }
                  return (
                    <tr key={m.id} className="border-b border-[#f0f0f0] hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-4 py-3 text-[#999]">{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/musteriler/${m.id}`} className="flex items-center gap-2 hover:text-[#1a1a1a] group">
                          <div className="w-7 h-7 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {m.firmaAdi?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1a1a1a] group-hover:underline">{m.firmaAdi}</p>
                            <p className="text-xs text-[#999]">{m.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-[#555] text-xs">#{m.kasaNo}</td>
                      <td className="px-4 py-3 text-[#555] text-xs">{teklif?.paketAdi || '-'}</td>
                      <td className="px-4 py-3 font-semibold text-[#1a1a1a]">{teklif ? `₺${teklif.toplam?.toLocaleString('tr-TR')}` : '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={badge.variant as any}>{badge.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-[#999] text-xs">{formatDate(m.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Link href={`/admin/musteriler/${m.id}`} className="p-1.5 hover:bg-[#f0f0f0] rounded-lg transition-colors" title="Detay">
                            <BarChart2 size={14} className="text-[#555]" />
                          </Link>
                          <Link href={`/admin/musteriler/${m.id}/edit`} className="p-1.5 hover:bg-[#f0f0f0] rounded-lg transition-colors" title="Düzenle">
                            <Edit size={14} className="text-[#555]" />
                          </Link>
                          <a href={`mailto:${m.email}`} className="p-1.5 hover:bg-[#f0f0f0] rounded-lg transition-colors" title="Mail">
                            <Mail size={14} className="text-[#555]" />
                          </a>
                          <button
                            onClick={() => setSilinecek(m.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
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
