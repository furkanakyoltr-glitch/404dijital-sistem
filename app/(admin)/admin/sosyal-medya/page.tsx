"use client"
import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, X, CheckCircle, AlertCircle, Clock, Upload } from 'lucide-react'

type Hesap = { id: string; adlandirma: string; sayfaId: string; igHesapId: string | null; aktif: boolean; musteri: { firmaAdi: string } | null; _count: { gonderiler: number } }
type Gonderi = {
  id: string; platform: string; tip: string; medyaUrl: string; aciklama: string
  planlananTarih: string; durum: string; hataMesaji: string | null; metaPostId: string | null
  hesap: { adlandirma: string }
}

const DURUM_RENK: Record<string, string> = {
  bekliyor: 'bg-amber-100 text-amber-700',
  yayinlandi: 'bg-green-100 text-green-700',
  hata: 'bg-red-100 text-red-700',
}
const DURUM_IKON: Record<string, any> = { bekliyor: Clock, yayinlandi: CheckCircle, hata: AlertCircle }

export default function SosyalMedyaPage() {
  const [hesaplar, setHesaplar] = useState<Hesap[]>([])
  const [gonderiler, setGonderiler] = useState<Gonderi[]>([])
  const [seciliHesap, setSeciliHesap] = useState<string>('')
  const [yukleniyor, setYukleniyor] = useState(true)

  const [hesapFormAcik, setHesapFormAcik] = useState(false)
  const [hAdlandirma, setHAdlandirma] = useState('')
  const [hSayfaId, setHSayfaId] = useState('')
  const [hToken, setHToken] = useState('')
  const [hKaydediliyor, setHKaydediliyor] = useState(false)
  const [hHata, setHHata] = useState('')

  const [gonderiFormAcik, setGonderiFormAcik] = useState(false)
  const [gPlatform, setGPlatform] = useState<'instagram' | 'facebook'>('instagram')
  const [gTip, setGTip] = useState<'reels' | 'foto'>('reels')
  const [gAciklama, setGAciklama] = useState('')
  const [gTarih, setGTarih] = useState('')
  const [gDosya, setGDosya] = useState<File | null>(null)
  const [gYukleniyor, setGYukleniyor] = useState(false)
  const [gHata, setGHata] = useState('')

  const hesaplariGetir = () => {
    fetch('/api/sosyal-medya/hesaplar').then(r => r.json()).then(d => {
      setHesaplar(d.hesaplar || [])
      if (!seciliHesap && d.hesaplar?.length) setSeciliHesap(d.hesaplar[0].id)
    })
  }
  const gonderileriGetir = (hesapId: string) => {
    setYukleniyor(true)
    fetch(`/api/sosyal-medya/gonderiler?hesapId=${hesapId}`).then(r => r.json()).then(d => setGonderiler(d.gonderiler || [])).finally(() => setYukleniyor(false))
  }

  useEffect(() => { hesaplariGetir() }, [])
  useEffect(() => { if (seciliHesap) gonderileriGetir(seciliHesap) }, [seciliHesap])

  const hesapKaydet = async () => {
    if (!hAdlandirma.trim() || !hSayfaId.trim() || !hToken.trim()) return
    setHKaydediliyor(true); setHHata('')
    try {
      const res = await fetch('/api/sosyal-medya/hesaplar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adlandirma: hAdlandirma, sayfaId: hSayfaId, erisimTokeni: hToken }),
      })
      const data = await res.json()
      if (!res.ok) { setHHata(data.error || 'Hata oluştu'); return }
      setHAdlandirma(''); setHSayfaId(''); setHToken(''); setHesapFormAcik(false)
      hesaplariGetir()
    } finally { setHKaydediliyor(false) }
  }

  const gonderiKaydet = async () => {
    if (!seciliHesap || !gDosya || !gTarih) return
    setGYukleniyor(true); setGHata('')
    try {
      const form = new FormData()
      form.append('hesapId', seciliHesap)
      form.append('platform', gPlatform)
      form.append('tip', gPlatform === 'instagram' ? gTip : 'foto')
      form.append('aciklama', gAciklama)
      form.append('planlananTarih', new Date(gTarih).toISOString())
      form.append('dosya', gDosya)
      const res = await fetch('/api/sosyal-medya/gonderiler', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setGHata(data.error || 'Hata oluştu'); return }
      setGAciklama(''); setGTarih(''); setGDosya(null); setGonderiFormAcik(false)
      gonderileriGetir(seciliHesap)
    } finally { setGYukleniyor(false) }
  }

  const gonderiSil = async (id: string) => {
    if (!confirm('Bu planlanan gönderiyi silmek istediğine emin misin?')) return
    await fetch(`/api/sosyal-medya/gonderiler/${id}`, { method: 'DELETE' })
    gonderileriGetir(seciliHesap)
  }

  const seciliHesapObj = hesaplar.find(h => h.id === seciliHesap)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Sosyal Medya Paylaşımları</h1>
        <button onClick={() => setHesapFormAcik(true)} className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#333]">
          <Plus size={16} /> Hesap Bağla
        </button>
      </div>

      {/* Hesap sekmeleri */}
      <div className="flex flex-wrap gap-2 mb-6">
        {hesaplar.map(h => (
          <button
            key={h.id}
            onClick={() => setSeciliHesap(h.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border ${seciliHesap === h.id ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-[#555] border-[#e5e5e5] hover:border-[#1a1a1a]'}`}
          >
            {h.adlandirma} {h.musteri ? `(${h.musteri.firmaAdi})` : ''} · {h._count.gonderiler} gönderi
          </button>
        ))}
        {!hesaplar.length && <p className="text-sm text-[#888]">Henüz bağlı hesap yok. Önce "Hesap Bağla" ile bir sayfa ekle.</p>}
      </div>

      {seciliHesapObj && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-[#666]">
              Sayfa ID: <span className="font-mono">{seciliHesapObj.sayfaId}</span>
              {seciliHesapObj.igHesapId ? <span className="ml-3 text-green-700">✓ Instagram bağlı</span> : <span className="ml-3 text-amber-700">Instagram bağlı değil (sadece Facebook paylaşımı)</span>}
            </div>
            <button onClick={() => setGonderiFormAcik(true)} className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#333]">
              <Upload size={16} /> Yeni Paylaşım Planla
            </button>
          </div>

          <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden">
            {yukleniyor ? (
              <div className="p-10 flex justify-center"><Loader2 className="animate-spin" size={24} /></div>
            ) : !gonderiler.length ? (
              <p className="p-10 text-center text-sm text-[#888]">Bu hesap için planlanmış gönderi yok.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#fafafa] text-left text-[#888] text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Tarih</th>
                    <th className="px-4 py-3">Platform / Tür</th>
                    <th className="px-4 py-3">Açıklama</th>
                    <th className="px-4 py-3">Durum</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {gonderiler.map(g => {
                    const Ikon = DURUM_IKON[g.durum] || Clock
                    return (
                      <tr key={g.id} className="border-t border-[#f0f0f0]">
                        <td className="px-4 py-3 whitespace-nowrap">{new Date(g.planlananTarih).toLocaleString('tr-TR')}</td>
                        <td className="px-4 py-3 capitalize">{g.platform} · {g.tip}</td>
                        <td className="px-4 py-3 max-w-xs truncate" title={g.aciklama}>{g.aciklama}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${DURUM_RENK[g.durum]}`}>
                            <Ikon size={12} /> {g.durum === 'bekliyor' ? 'Bekliyor' : g.durum === 'yayinlandi' ? 'Yayınlandı' : 'Hata'}
                          </span>
                          {g.durum === 'hata' && g.hataMesaji && <p className="text-xs text-red-600 mt-1 max-w-xs">{g.hataMesaji}</p>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {g.durum === 'bekliyor' && (
                            <button onClick={() => gonderiSil(g.id)} className="text-[#999] hover:text-red-600"><Trash2 size={16} /></button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Hesap bağlama modalı */}
      {hesapFormAcik && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Facebook/Instagram Hesabı Bağla</h2>
              <button onClick={() => setHesapFormAcik(false)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#666]">Adlandırma (panelde göreceğin isim)</label>
                <input value={hAdlandirma} onChange={e => setHAdlandirma(e.target.value)} placeholder="örn. Harbee" className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#666]">Facebook Sayfa ID</label>
                <input value={hSayfaId} onChange={e => setHSayfaId(e.target.value)} placeholder="örn. 189516568301999" className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 mt-1 font-mono text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#666]">Sayfa Erişim Token'ı (Page Access Token)</label>
                <textarea value={hToken} onChange={e => setHToken(e.target.value)} rows={3} className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 mt-1 font-mono text-xs" />
              </div>
              {hHata && <p className="text-sm text-red-600">{hHata}</p>}
              <button onClick={hesapKaydet} disabled={hKaydediliyor} className="w-full bg-[#1a1a1a] text-white py-2.5 rounded-xl font-semibold disabled:opacity-50">
                {hKaydediliyor ? 'Doğrulanıyor...' : 'Bağla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Yeni paylaşım modalı */}
      {gonderiFormAcik && seciliHesapObj && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Yeni Paylaşım Planla — {seciliHesapObj.adlandirma}</h2>
              <button onClick={() => setGonderiFormAcik(false)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button onClick={() => setGPlatform('instagram')} disabled={!seciliHesapObj.igHesapId} className={`flex-1 py-2 rounded-xl text-sm font-semibold border disabled:opacity-40 ${gPlatform === 'instagram' ? 'bg-[#1a1a1a] text-white' : 'border-[#e5e5e5]'}`}>Instagram</button>
                <button onClick={() => setGPlatform('facebook')} className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${gPlatform === 'facebook' ? 'bg-[#1a1a1a] text-white' : 'border-[#e5e5e5]'}`}>Facebook</button>
              </div>
              {gPlatform === 'instagram' && (
                <div className="flex gap-2">
                  <button onClick={() => setGTip('reels')} className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${gTip === 'reels' ? 'bg-[#1a1a1a] text-white' : 'border-[#e5e5e5]'}`}>Reels (video)</button>
                  <button onClick={() => setGTip('foto')} className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${gTip === 'foto' ? 'bg-[#1a1a1a] text-white' : 'border-[#e5e5e5]'}`}>Görsel</button>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-[#666]">Dosya</label>
                <input type="file" accept={gTip === 'reels' && gPlatform === 'instagram' ? 'video/*' : 'image/*'} onChange={e => setGDosya(e.target.files?.[0] || null)} className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 mt-1 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#666]">Açıklama / Caption</label>
                <textarea value={gAciklama} onChange={e => setGAciklama(e.target.value)} rows={4} className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 mt-1 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#666]">Yayın Tarihi/Saati</label>
                <input type="datetime-local" value={gTarih} onChange={e => setGTarih(e.target.value)} className="w-full border border-[#e5e5e5] rounded-xl px-3 py-2.5 mt-1" />
              </div>
              {gHata && <p className="text-sm text-red-600">{gHata}</p>}
              <button onClick={gonderiKaydet} disabled={gYukleniyor} className="w-full bg-[#1a1a1a] text-white py-2.5 rounded-xl font-semibold disabled:opacity-50">
                {gYukleniyor ? 'Yükleniyor...' : 'Planla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
