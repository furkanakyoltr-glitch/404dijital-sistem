"use client"
import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { LEAD_DURUMLAR, leadDurumLabel } from '@/lib/leads'

const DURUM_BADGE: Record<string, any> = {
  yeni_lead: 'info',
  on_gorusme: 'warning',
  gorusuldu: 'outline',
  teklif_hazirlaniyor: 'warning',
  teklif_gonderildi: 'info',
  takip_edilecek: 'warning',
  kazandi: 'success',
  kaybedildi: 'destructive',
}

export default function LeadlerPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [durumFilter, setDurumFilter] = useState('')
  const [notDraft, setNotDraft] = useState<Record<string, string>>({})

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('arama', search)
    if (durumFilter) params.set('durum', durumFilter)
    try {
      const res = await fetch(`/api/leads?${params}`)
      const data = await res.json()
      setLeads(data.data || [])
    } finally {
      setLoading(false)
    }
  }, [search, durumFilter])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const handleDurumChange = async (id: string, durum: string) => {
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, durum } : l)))
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ durum }),
    })
  }

  const handleTakipNotuSave = async (id: string) => {
    const takipNotu = notDraft[id]
    if (takipNotu === undefined) return
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ takipNotu }),
    })
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, takipNotu } : l)))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] w-4 h-4" />
          <input
            type="text"
            placeholder="Lead ara..."
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
          {LEAD_DURUMLAR.map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-[#eaeaea] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-montserrat">
            <thead>
              <tr className="border-b border-[#eaeaea] bg-[#f8f9fa]">
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Ad Soyad</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Firma</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Telefon</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">E-posta</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Hizmet İlgisi</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Mesaj</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Kaynak</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Tarih</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Durum</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Takip Notu</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-12 text-[#999]">Yükleniyor...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-[#999]">Lead bulunamadı</td></tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id} className="border-b border-[#f0f0f0] hover:bg-[#f8f9fa] transition-colors align-top">
                    <td className="px-4 py-3 font-semibold text-[#1a1a1a] whitespace-nowrap">{lead.adSoyad || '-'}</td>
                    <td className="px-4 py-3 text-[#555] whitespace-nowrap">{lead.firmaAdi || '-'}</td>
                    <td className="px-4 py-3 text-[#555] whitespace-nowrap">{lead.telefon || '-'}</td>
                    <td className="px-4 py-3 text-[#555]">{lead.email || '-'}</td>
                    <td className="px-4 py-3 text-[#555] whitespace-nowrap">{lead.hizmetIlgisi || '-'}</td>
                    <td className="px-4 py-3 text-[#555] max-w-xs truncate" title={lead.mesaj || ''}>{lead.mesaj || '-'}</td>
                    <td className="px-4 py-3 text-[#999] text-xs whitespace-nowrap">{lead.kaynak}</td>
                    <td className="px-4 py-3 text-[#999] text-xs whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.durum}
                        onChange={e => handleDurumChange(lead.id, e.target.value)}
                        className="border border-[#eaeaea] rounded-lg px-2 py-1.5 text-xs font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                      >
                        {LEAD_DURUMLAR.map(d => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                      <div className="mt-1.5">
                        <Badge variant={DURUM_BADGE[lead.durum] || 'outline'}>{leadDurumLabel(lead.durum)}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[200px]">
                      <textarea
                        defaultValue={lead.takipNotu || ''}
                        onChange={e => setNotDraft(prev => ({ ...prev, [lead.id]: e.target.value }))}
                        onBlur={() => handleTakipNotuSave(lead.id)}
                        placeholder="Takip notu ekle..."
                        rows={2}
                        className="w-full border border-[#eaeaea] rounded-lg px-2 py-1.5 text-xs font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
