"use client"
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

const DURUM_SECENEKLERI = [
  { value: 'aktif', label: 'Aktif' },
  { value: 'odeme_alinacak', label: 'Ödeme Alınacak' },
  { value: 'bekliyor', label: 'Beklemede' },
  { value: 'arsiv', label: 'Arşiv' },
]

export default function MusteriEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firmaAdi: '',
    yetkiliKisi: '',
    telefon: '',
    email: '',
    adres: '',
    durum: 'aktif',
  })

  useEffect(() => {
    fetch(`/api/musteriler/${id}`)
      .then(r => r.json())
      .then(m => {
        setForm({
          firmaAdi: m.firmaAdi || '',
          yetkiliKisi: m.yetkiliKisi || '',
          telefon: m.telefon || '',
          email: m.email || '',
          adres: m.adres || '',
          durum: m.durum || 'aktif',
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/musteriler/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        router.push(`/admin/musteriler/${id}`)
      } else {
        alert('Kayıt sırasında hata oluştu')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-[#1a1a1a] border-t-transparent rounded-full"></div>
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#555] hover:text-[#1a1a1a] font-montserrat text-sm transition-colors">
          <ArrowLeft size={16} /> Geri
        </button>
        <h2 className="font-bebas text-2xl text-[#1a1a1a] tracking-wider">MÜŞTERİ DÜZENLE</h2>
      </div>

      <div className="bg-white rounded-2xl border border-[#eaeaea] p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Firma Adı *</label>
            <input
              type="text"
              value={form.firmaAdi}
              onChange={e => setForm(p => ({ ...p, firmaAdi: e.target.value }))}
              className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Yetkili Kişi</label>
            <input
              type="text"
              value={form.yetkiliKisi}
              onChange={e => setForm(p => ({ ...p, yetkiliKisi: e.target.value }))}
              className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Telefon</label>
            <input
              type="tel"
              value={form.telefon}
              onChange={e => setForm(p => ({ ...p, telefon: e.target.value }))}
              className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">E-posta</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Adres</label>
            <input
              type="text"
              value={form.adres}
              onChange={e => setForm(p => ({ ...p, adres: e.target.value }))}
              className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Durum</label>
            <select
              value={form.durum}
              onChange={e => setForm(p => ({ ...p, durum: e.target.value }))}
              className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
            >
              {DURUM_SECENEKLERI.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !form.firmaAdi}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white rounded-xl px-6 py-3 font-montserrat font-bold text-sm hover:bg-[#333] transition-colors disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'KAYDEDİLİYOR...' : 'KAYDET'}
          </button>
          <button
            onClick={() => router.back()}
            className="border-2 border-[#eaeaea] text-[#555] rounded-xl px-6 py-3 font-montserrat font-bold text-sm hover:border-[#1a1a1a] transition-colors"
          >
            İPTAL
          </button>
        </div>
      </div>
    </div>
  )
}
