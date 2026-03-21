"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X } from 'lucide-react'

export default function GelirEklePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [musteriler, setMusteriler] = useState<any[]>([])
  const [form, setForm] = useState({
    musteriId: '', musteriAdi: '', gelirTuru: 'Paket Ödemesi', tutar: '', kdvOrani: '20', kdvDahil: true,
    tarih: new Date().toISOString().split('T')[0], aciklama: '', dekontNo: '', odemeYontemi: 'Havale/EFT',
    banka: '', tahsilatDurumu: 'Tahsil Edildi', kismiTutar: '', vadeTarihi: '',
  })
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    fetch('/api/musteriler?limit=100').then(r => r.json()).then(d => setMusteriler(d.data || [])).catch(() => {})
  }, [])

  const setField = (f: string, v: any) => setForm(p => ({ ...p, [f]: v }))

  const tutar = parseFloat(form.tutar) || 0
  const kdv = parseFloat(form.kdvOrani) / 100
  const netTutar = form.kdvDahil ? tutar / (1 + kdv) : tutar
  const toplamTutar = form.kdvDahil ? tutar : tutar * (1 + kdv)
  const kdvTutar = toplamTutar - netTutar

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let dekontUrl = null
      if (file) {
        const fd = new FormData()
        fd.append('file', file); fd.append('tip', 'gelir')
        const uploadRes = await fetch('/api/muhasebe/upload', { method: 'POST', body: fd })
        const uploadData = await uploadRes.json()
        dekontUrl = uploadData.url
      }
      await fetch('/api/muhasebe/gelir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tutar: netTutar, netTutar: toplamTutar, dekontUrl }),
      })
      router.push('/admin/muhasebe/gelir')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[#555] hover:text-[#1a1a1a] font-montserrat text-sm">
        <ArrowLeft size={16} /> Geri Dön
      </button>
      <div className="bg-white rounded-2xl border border-[#eaeaea] p-8">
        <h2 className="font-bebas text-2xl tracking-wider text-[#1a1a1a] mb-6">YENİ GELİR EKLE</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Müşteri Seç</label>
              <select value={form.musteriId} onChange={e => { setField('musteriId', e.target.value); setField('musteriAdi', musteriler.find(m => m.id === e.target.value)?.firmaAdi || '') }}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]">
                <option value="">-- Diğer (Manuel) --</option>
                {musteriler.map(m => <option key={m.id} value={m.id}>{m.firmaAdi}</option>)}
              </select>
            </div>
            {!form.musteriId && (
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Müşteri Adı</label>
                <input type="text" value={form.musteriAdi} onChange={e => setField('musteriAdi', e.target.value)}
                  className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Gelir Türü</label>
              <select value={form.gelirTuru} onChange={e => setField('gelirTuru', e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]">
                {['Paket Ödemesi', 'Ek Hizmet', 'Danışmanlık', 'Ürün Satışı', 'Diğer'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Tarih</label>
              <input type="date" value={form.tarih} onChange={e => setField('tarih', e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Tutar (₺)</label>
              <input type="number" step="0.01" value={form.tutar} onChange={e => setField('tutar', e.target.value)} required
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">KDV Oranı</label>
              <div className="flex gap-2">
                <select value={form.kdvOrani} onChange={e => setField('kdvOrani', e.target.value)}
                  className="flex-1 border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]">
                  {['1','8','18','20'].map(v => <option key={v} value={v}>%{v}</option>)}
                </select>
                <div className="flex items-center gap-2 border border-[#eaeaea] rounded-xl px-3">
                  <input type="checkbox" id="kdvDahil" checked={form.kdvDahil} onChange={e => setField('kdvDahil', e.target.checked)} className="w-4 h-4" />
                  <label htmlFor="kdvDahil" className="text-xs font-montserrat text-[#555] whitespace-nowrap">Dahil</label>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Ödeme Yöntemi</label>
              <select value={form.odemeYontemi} onChange={e => setField('odemeYontemi', e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]">
                {['Havale/EFT','Kredi Kartı','Nakit','Çek','Senet'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Tahsilat Durumu</label>
              <select value={form.tahsilatDurumu} onChange={e => setField('tahsilatDurumu', e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]">
                {['Tahsil Edildi','Beklemede','Kısmi Tahsilat'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            {form.tahsilatDurumu === 'Kısmi Tahsilat' && (
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Kısmi Tutar (₺)</label>
                <input type="number" value={form.kismiTutar} onChange={e => setField('kismiTutar', e.target.value)}
                  className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
              </div>
            )}
            {['Beklemede','Kısmi Tahsilat'].includes(form.tahsilatDurumu) && (
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Vade Tarihi</label>
                <input type="date" value={form.vadeTarihi} onChange={e => setField('vadeTarihi', e.target.value)} required
                  className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Dekont/Fiş No</label>
              <input type="text" value={form.dekontNo} onChange={e => setField('dekontNo', e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Açıklama</label>
              <textarea rows={2} value={form.aciklama} onChange={e => setField('aciklama', e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Dekont/Fiş Yükle</label>
              <div className="border-2 border-dashed border-[#eaeaea] rounded-xl p-4 text-center hover:border-[#1a1a1a] transition-colors cursor-pointer" onClick={() => document.getElementById('fileInput')?.click()}>
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-sm font-montserrat text-[#555]">
                    <span>{file.name}</span>
                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null) }} className="text-red-400"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="text-[#999] font-montserrat text-sm">
                    <Upload size={20} className="mx-auto mb-1" />
                    PDF, JPEG veya PNG yükleyin
                  </div>
                )}
                <input id="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>
          </div>

          {/* KDV Özet */}
          {form.tutar && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm font-montserrat">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-[#999] text-xs">Net Tutar</p><p className="font-bold text-[#1a1a1a]">₺{netTutar.toFixed(2)}</p></div>
                <div><p className="text-[#999] text-xs">KDV</p><p className="font-bold text-[#1a1a1a]">₺{kdvTutar.toFixed(2)}</p></div>
                <div><p className="text-[#999] text-xs">Toplam</p><p className="font-bold text-green-600">₺{toplamTutar.toFixed(2)}</p></div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
              {loading ? 'KAYDEDİLİYOR...' : 'GELİRİ KAYDET'}
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
