"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus, Copy, Check } from 'lucide-react'

export default function MusteriEklePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ kasaNo: string; sifre: string; musteriId: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    firmaAdi: '', yetkiliKisi: '', yetkiliUnvan: '',
    telefon: '', email: '', adres: '', vergiDairesi: '', vergiNo: '', notlar: '',
    durum: 'odeme_alinacak',
  })

  const setF = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }))

  const handleSave = async () => {
    if (!form.firmaAdi || !form.yetkiliKisi || !form.telefon || !form.email) {
      alert('Firma adı, yetkili kişi, telefon ve e-posta zorunludur.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/musteriler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data)
      } else {
        alert(`Hata: ${data.error || 'Bilinmeyen hata'}`)
      }
    } catch {
      alert('Sunucu bağlantı hatası')
    } finally {
      setSaving(false)
    }
  }

  const copyBilgiler = () => {
    if (!result) return
    const text = `Kasa No: ${result.kasaNo}\nŞifre: ${result.sifre}\nGiriş: https://teklif.404dijital.com`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-[#eaeaea] p-10 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="font-bebas text-2xl tracking-wider text-[#1a1a1a] mb-2">MÜŞTERİ EKLENDİ</h2>
          <p className="text-[#555] font-montserrat text-sm mb-6">{form.firmaAdi} sisteme eklendi.</p>
          <div className="bg-[#1a1a1a] text-white rounded-xl p-5 mb-6 text-left font-mono text-sm space-y-2">
            <div className="flex justify-between"><span className="text-gray-400">Kasa No:</span><span className="text-[#ffc107] font-bold">{result.kasaNo}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Şifre:</span><span className="text-white font-bold">{result.sifre}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Portal:</span><span className="text-blue-400">teklif.404dijital.com</span></div>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={copyBilgiler} className="flex items-center gap-2 border-2 border-[#eaeaea] text-[#555] rounded-xl px-5 py-2.5 font-montserrat font-bold text-sm hover:border-[#1a1a1a] transition-colors">
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              {copied ? 'Kopyalandı!' : 'Bilgileri Kopyala'}
            </button>
            <button onClick={() => router.push(`/admin/musteriler/${result.musteriId}`)} className="btn-primary text-sm">
              Müşteri Sayfasına Git
            </button>
            <button onClick={() => router.push('/admin/teklif-olustur')} className="border-2 border-[#1a1a1a] text-[#1a1a1a] rounded-xl px-5 py-2.5 font-montserrat font-bold text-sm hover:bg-[#1a1a1a] hover:text-white transition-all">
              Teklif Oluştur
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#555] hover:text-[#1a1a1a] font-montserrat text-sm transition-colors">
          <ArrowLeft size={16} /> Geri
        </button>
        <h2 className="font-bebas text-2xl text-[#1a1a1a] tracking-wider">YENİ MÜŞTERİ EKLE</h2>
      </div>

      <div className="bg-white rounded-2xl border border-[#eaeaea] p-6 space-y-4">
        <p className="text-xs text-[#999] font-montserrat">Müşteri eklenince otomatik kasa numarası ve şifre oluşturulur. İstersen sonradan teklif de ekleyebilirsin.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { field: 'firmaAdi', label: 'Firma Adı *', type: 'text' },
            { field: 'yetkiliKisi', label: 'Yetkili Kişi *', type: 'text' },
            { field: 'yetkiliUnvan', label: 'Unvan', type: 'text' },
            { field: 'telefon', label: 'Telefon *', type: 'tel' },
            { field: 'email', label: 'E-posta *', type: 'email' },
            { field: 'vergiDairesi', label: 'Vergi Dairesi', type: 'text' },
            { field: 'vergiNo', label: 'Vergi No', type: 'text' },
          ].map(({ field, label, type }) => (
            <div key={field} className={field === 'email' || field === 'vergiDairesi' ? '' : ''}>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">{label}</label>
              <input
                type={type}
                value={(form as any)[field]}
                onChange={e => setF(field, e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Durum</label>
            <select value={form.durum} onChange={e => setF('durum', e.target.value)}
              className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]">
              <option value="aktif">Aktif</option>
              <option value="odeme_alinacak">Ödeme Alınacak</option>
              <option value="bekliyor">Beklemede</option>
              <option value="arsiv">Arşiv</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Adres</label>
            <input type="text" value={form.adres} onChange={e => setF('adres', e.target.value)}
              className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Notlar</label>
            <textarea value={form.notlar} onChange={e => setF('notlar', e.target.value)} rows={3}
              className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] resize-none" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving || !form.firmaAdi || !form.yetkiliKisi || !form.telefon || !form.email}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white rounded-xl px-6 py-3 font-montserrat font-bold text-sm hover:bg-[#333] transition-colors disabled:opacity-60">
            <UserPlus size={16} />
            {saving ? 'EKLENİYOR...' : 'MÜŞTERİ EKLE'}
          </button>
          <button onClick={() => router.back()}
            className="border-2 border-[#eaeaea] text-[#555] rounded-xl px-6 py-3 font-montserrat font-bold text-sm hover:border-[#1a1a1a] transition-colors">
            İPTAL
          </button>
        </div>
      </div>
    </div>
  )
}
