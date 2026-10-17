"use client"
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, FileText, CheckCircle2 } from 'lucide-react'
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
  const [notSaving, setNotSaving] = useState<Record<string, boolean>>({})

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

  const handleNotEkle = async (id: string) => {
    const icerik = (notDraft[id] || '').trim()
    if (!icerik) return
    setNotSaving(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch(`/api/leads/${id}/notlar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icerik }),
      })
      const data = await res.json()
      if (data.success) {
        setLeads(prev => prev.map(l => (l.id === id ? { ...l, notlar: [data.not, ...(l.notlar || [])] } : l)))
        setNotDraft(prev => ({ ...prev, [id]: '' }))
      }
    } finally {
      setNotSaving(prev => ({ ...prev, [id]: false }))
    }
  }

  const teklifOlusturUrl = (lead: any) => {
    const params = new URLSearchParams({
      leadId: lead.id,
      firmaAdi: lead.firmaAdi || '',
      yetkiliKisi: lead.adSoyad || '',
      telefon: lead.telefon || '',
      email: lead.email || '',
      notlar: lead.mesaj || '',
    })
    return `/admin/teklif-olustur?${params.toString()}`
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
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Reklam Detayı</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Tarih</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Durum</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Takip Geçmişi</th>
                <th className="text-left px-4 py-3 text-[#999] font-semibold text-xs uppercase tracking-wider">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={12} className="text-center py-12 text-[#999]">Yükleniyor...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={12} className="text-center py-12 text-[#999]">Lead bulunamadı</td></tr>
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
                    <td className="px-4 py-3 text-[#999] text-xs max-w-[220px]">
                      {lead.reklamDetay ? <ReklamDetayi raw={lead.reklamDetay} /> : '-'}
                    </td>
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
                    <td className="px-4 py-3 min-w-[240px]">
                      <div className="space-y-1.5 max-h-32 overflow-y-auto mb-2">
                        {(lead.notlar || []).length === 0 ? (
                          <p className="text-xs text-[#999] italic">Henüz not yok.</p>
                        ) : (
                          lead.notlar.map((n: any) => (
                            <div key={n.id} className="bg-[#f8f9fa] rounded-lg px-2.5 py-1.5">
                              <p className="text-xs text-[#1a1a1a]">{n.icerik}</p>
                              <p className="text-[10px] text-[#999] mt-0.5">
                                {formatDate(n.createdAt)}{n.olusturan?.name ? ` — ${n.olusturan.name}` : ''}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={notDraft[lead.id] || ''}
                          onChange={e => setNotDraft(prev => ({ ...prev, [lead.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') handleNotEkle(lead.id) }}
                          placeholder="Not ekle..."
                          className="flex-1 border border-[#eaeaea] rounded-lg px-2 py-1.5 text-xs font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                        />
                        <button
                          onClick={() => handleNotEkle(lead.id)}
                          disabled={notSaving[lead.id]}
                          className="bg-[#1a1a1a] text-white text-xs font-bold px-3 rounded-lg disabled:opacity-50"
                        >
                          Ekle
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {lead.musteri ? (
                        <Link
                          href={`/admin/musteriler/${lead.musteri.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-montserrat font-semibold text-green-600"
                        >
                          <CheckCircle2 size={14} /> Müşteri Oldu
                        </Link>
                      ) : (
                        <Link
                          href={teklifOlusturUrl(lead)}
                          className="inline-flex items-center gap-1.5 bg-[#1a1a1a] text-white text-xs font-montserrat font-bold px-3 py-2 rounded-lg hover:bg-black transition-colors"
                        >
                          <FileText size={14} /> Teklif Oluştur
                        </Link>
                      )}
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

function ReklamDetayi({ raw }: { raw: string }) {
  const params = new URLSearchParams(raw)
  const kampanya = params.get('utm_campaign')
  const icerik = params.get('utm_content')
  const kaynak = params.get('utm_source')
  const fbclid = params.get('fbclid')
  const gclid = params.get('gclid')

  if (!kampanya && !icerik && !kaynak && !fbclid && !gclid) {
    return <span className="truncate block" title={raw}>{raw}</span>
  }

  return (
    <div className="space-y-0.5">
      {kaynak && <p><span className="text-[#ccc]">Kaynak:</span> {kaynak}</p>}
      {kampanya && <p className="truncate" title={kampanya}><span className="text-[#ccc]">Kampanya:</span> {kampanya}</p>}
      {icerik && <p className="truncate" title={icerik}><span className="text-[#ccc]">Reklam:</span> {icerik}</p>}
      {fbclid && <p className="text-[#ccc]">Meta tık ID var</p>}
      {gclid && <p className="text-[#ccc]">Google tık ID var</p>}
    </div>
  )
}
