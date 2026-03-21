"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X } from 'lucide-react'

const KATEGORILER: Record<string, string[]> = {
  'Reklam Bütçesi': ['Meta', 'Google', 'TikTok', 'LinkedIn', 'Diğer Reklam'],
  'Çalışan Giderleri': ['Maaş', 'Prim', 'SGK', 'Yemek', 'Yol'],
  'Ofis Giderleri': ['Kira', 'Elektrik', 'Su', 'İnternet', 'Telefon', 'Kırtasiye'],
  'Yazılım & Lisans': ['Adobe', 'Canva', 'Asana', 'Slack', 'Diğer'],
  'Vergi & Yasal': ['KDV', 'Gelir Vergisi', 'Damga Vergisi', 'Harçlar'],
  'Ulaşım & Seyahat': ['Akaryakıt', 'Otobüs', 'Uçak', 'Konaklama'],
  'Danışmanlık & Dış Hizmet': [],
  'Diğer Giderler': [],
}

export default function GiderEklePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    kategori: 'Reklam Bütçesi', altKategori: '', tutar: '', kdvOrani: '20', kdvDahil: false,
    tarih: new Date().toISOString().split('T')[0], aciklama: '', fisNo: '',
    odemeYontemi: 'Havale/EFT', banka: '', odemeDurumu: 'Ödendi', kismiTutar: '', vadeTarihi: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const setField = (f: string, v: any) => setForm(p => ({ ...p, [f]: v }))
  const tutar = parseFloat(form.tutar) || 0
  const kdv = parseFloat(form.kdvOrani) / 100
  const netTutar = form.kdvDahil ? tutar / (1 + kdv) : tutar
  const toplamTutar = form.kdvDahil ? tutar : tutar * (1 + kdv)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/muhasebe/gider', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tutar: netTutar, netTutar: toplamTutar }),
      })
      router.push('/admin/muhasebe/gider')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[#555] hover:text-[#1a1a1a] font-montserrat text-sm">
        <ArrowLeft size={16} /> Geri Dön
      </button>
      <div className="bg-white rounded-2xl border border-[#eaeaea] p-8">
        <h2 className="font-bebas text-2xl tracking-wider text-[#1a1a1a] mb-6">YENİ GİDER EKLE</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Kategori</label>
              <select value={form.kategori} onChange={e => { setField('kategori', e.target.value); setField('altKategori', '') }}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]">
                {Object.keys(KATEGORILER).map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Alt Kategori</label>
              <select value={form.altKategori} onChange={e => setField('altKategori', e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]">
                <option value="">Seçiniz</option>
                {(KATEGORILER[form.kategori] || []).map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Tutar (₺)</label>
              <input type="number" step="0.01" value={form.tutar} onChange={e => setField('tutar', e.target.value)} required
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">KDV</label>
              <div className="flex gap-2">
                <select value={form.kdvOrani} onChange={e => setField('kdvOrani', e.target.value)}
                  className="flex-1 border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]">
                  {['0','1','8','18','20'].map(v => <option key={v} value={v}>%{v}</option>)}
                </select>
                <div className="flex items-center gap-2 border border-[#eaeaea] rounded-xl px-3">
                  <input type="checkbox" id="kdvDahil" checked={form.kdvDahil} onChange={e => setField('kdvDahil', e.target.checked)} className="w-4 h-4" />
                  <label htmlFor="kdvDahil" className="text-xs font-montserrat text-[#555] whitespace-nowrap">Dahil</label>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Tarih</label>
              <input type="date" value={form.tarih} onChange={e => setField('tarih', e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Ödeme Durumu</label>
              <select value={form.odemeDurumu} onChange={e => setField('odemeDurumu', e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]">
                {['Ödendi','Beklemede','Kısmi Ödeme'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Ödeme Yöntemi</label>
              <select value={form.odemeYontemi} onChange={e => setField('odemeYontemi', e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]">
                {['Havale/EFT','Kredi Kartı','Nakit','Çek','Senet'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Fiş/Fatura No</label>
              <input type="text" value={form.fisNo} onChange={e => setField('fisNo', e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Açıklama</label>
              <textarea rows={2} value={form.aciklama} onChange={e => setField('aciklama', e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Fiş/Fatura Yükle</label>
              <div className="border-2 border-dashed border-[#eaeaea] rounded-xl p-4 text-center hover:border-[#1a1a1a] transition-colors cursor-pointer" onClick={() => document.getElementById('giderFileInput')?.click()}>
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-sm font-montserrat">
                    <span>{file.name}</span>
                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null) }} className="text-red-400"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="text-[#999] font-montserrat text-sm"><Upload size={20} className="mx-auto mb-1" />PDF, JPEG veya PNG</div>
                )}
                <input id="giderFileInput" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>
          </div>
          {form.tutar && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm font-montserrat">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-[#999] text-xs">Net</p><p className="font-bold">₺{netTutar.toFixed(2)}</p></div>
                <div><p className="text-[#999] text-xs">KDV</p><p className="font-bold">₺{(toplamTutar - netTutar).toFixed(2)}</p></div>
                <div><p className="text-[#999] text-xs">Toplam</p><p className="font-bold text-red-600">₺{toplamTutar.toFixed(2)}</p></div>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60" style={{background:'#ef4444'}}>
              {loading ? 'KAYDEDİLİYOR...' : 'GİDERİ KAYDET'}
            </button>
            <button type="button" onClick={() => router.back()} className="border-2 border-[#eaeaea] rounded-full px-6 py-2.5 font-montserrat font-bold text-sm hover:border-[#1a1a1a] transition-all">
              İPTAL
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
