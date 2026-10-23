"use client"
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Plus, X, Loader2, Trello, Trash2, User, Calendar, Building2, Flag } from 'lucide-react'

type Pano = { id: string; ad: string; departman: string; _count: { gorevler: number } }
type EkipKisi = { id: string; name: string; departman: string }
type Musteri = { id: string; firmaAdi: string }
type Gorev = {
  id: string
  baslik: string
  aciklama: string | null
  durum: string
  oncelik: string
  sonTarih: string | null
  atanan: { id: string; name: string } | null
  olusturan: { id: string; name: string } | null
  musteri: { id: string; firmaAdi: string } | null
}

const SUTUNLAR = [
  { deger: 'yapilacak', etiket: 'Yapılacak' },
  { deger: 'devam', etiket: 'Devam Ediyor' },
  { deger: 'tamamlandi', etiket: 'Tamamlandı' },
]

const ONCELIK_RENK: Record<string, string> = {
  dusuk: 'bg-[#f0f0f0] text-[#777]',
  normal: 'bg-blue-50 text-blue-600',
  yuksek: 'bg-red-50 text-red-600',
}
const ONCELIK_ETIKET: Record<string, string> = { dusuk: 'Düşük', normal: 'Normal', yuksek: 'Yüksek' }

import { Suspense } from 'react'

export default function PanolarPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#999]" /></div>}>
      <PanolarIcerik />
    </Suspense>
  )
}

function PanolarIcerik() {
  const { data: session } = useSession()
  const departman = (session?.user as any)?.departman
  const searchParams = useSearchParams()
  const router = useRouter()
  const onAtananId = searchParams.get('atananId')
  const onAtananAdi = searchParams.get('atananAdi')
  const onDepartman = searchParams.get('departman')

  const [panolar, setPanolar] = useState<Pano[]>([])
  const [aktifPano, setAktifPano] = useState<string | null>(null)
  const [gorevler, setGorevler] = useState<Gorev[]>([])
  const [ekip, setEkip] = useState<EkipKisi[]>([])
  const [musteriler, setMusteriler] = useState<Musteri[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [gorevYukleniyor, setGorevYukleniyor] = useState(false)

  const [yeniPanoAcik, setYeniPanoAcik] = useState(false)
  const [yeniPanoAdi, setYeniPanoAdi] = useState('')

  const [yeniGorevAcik, setYeniGorevAcik] = useState(false)
  const [gBaslik, setGBaslik] = useState('')
  const [gAciklama, setGAciklama] = useState('')
  const [gOncelik, setGOncelik] = useState('normal')
  const [gAtanan, setGAtanan] = useState('')
  const [gMusteri, setGMusteri] = useState('')
  const [gSonTarih, setGSonTarih] = useState('')
  const [kaydediliyor, setKaydediliyor] = useState(false)

  const panolariGetir = useCallback(() => {
    setYukleniyor(true)
    const q = onDepartman ? `?departman=${onDepartman}` : ''
    fetch(`/api/panolar${q}`)
      .then(res => res.json())
      .then(data => {
        setPanolar(data.data || [])
        if (data.data?.length && !aktifPano) setAktifPano(data.data[0].id)
      })
      .finally(() => setYukleniyor(false))
  }, [aktifPano, onDepartman])

  useEffect(() => { panolariGetir() }, [])
  useEffect(() => {
    fetch('/api/ekip').then(res => res.json()).then(data => setEkip(data.data || []))
    fetch('/api/musteriler?limit=200').then(res => res.json()).then(data => setMusteriler(data.data || []))
  }, [])

  const gorevleriGetir = useCallback((panoId: string) => {
    setGorevYukleniyor(true)
    fetch(`/api/gorevler?panoId=${panoId}`)
      .then(res => res.json())
      .then(data => setGorevler(data.data || []))
      .finally(() => setGorevYukleniyor(false))
  }, [])

  useEffect(() => { if (aktifPano) gorevleriGetir(aktifPano) }, [aktifPano, gorevleriGetir])

  useEffect(() => {
    if (onAtananId && aktifPano) {
      setGAtanan(onAtananId)
      setYeniGorevAcik(true)
      router.replace('/admin/panolar', { scroll: false })
    }
  }, [onAtananId, aktifPano, router])

  const panoOlustur = async () => {
    if (!yeniPanoAdi.trim()) return
    const res = await fetch('/api/panolar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ad: yeniPanoAdi }),
    })
    if (res.ok) {
      setYeniPanoAdi(''); setYeniPanoAcik(false)
      panolariGetir()
    }
  }

  const panoSil = async (id: string) => {
    if (!confirm('Bu pano ve içindeki tüm görevler silinecek. Emin misin?')) return
    const res = await fetch(`/api/panolar/${id}`, { method: 'DELETE' })
    if (res.ok) { setAktifPano(null); panolariGetir() }
  }

  const gorevFormuSifirla = () => {
    setGBaslik(''); setGAciklama(''); setGOncelik('normal'); setGAtanan(''); setGMusteri(''); setGSonTarih('')
    setYeniGorevAcik(false)
  }

  const gorevOlustur = async () => {
    if (!gBaslik.trim() || !aktifPano) return
    setKaydediliyor(true)
    const res = await fetch('/api/gorevler', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        panoId: aktifPano, baslik: gBaslik, aciklama: gAciklama || null,
        oncelik: gOncelik, atananId: gAtanan || null, musteriId: gMusteri || null,
        sonTarih: gSonTarih || null,
      }),
    })
    setKaydediliyor(false)
    if (res.ok) {
      gorevFormuSifirla()
      gorevleriGetir(aktifPano)
    }
  }

  const durumDegistir = async (gorevId: string, durum: string) => {
    setGorevler(prev => prev.map(g => g.id === gorevId ? { ...g, durum } : g))
    await fetch(`/api/gorevler/${gorevId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ durum }),
    })
  }

  const gorevSil = async (gorevId: string) => {
    if (!confirm('Görev silinsin mi?')) return
    const res = await fetch(`/api/gorevler/${gorevId}`, { method: 'DELETE' })
    if (res.ok && aktifPano) gorevleriGetir(aktifPano)
  }

  const secilenPano = panolar.find(p => p.id === aktifPano)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Trello size={20} className="text-[#1a1a1a]" />
          <h2 className="font-montserrat font-bold text-lg text-[#1a1a1a]">Panolar</h2>
        </div>
        <button onClick={() => setYeniPanoAcik(true)}
          className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2.5 rounded-xl text-sm font-montserrat font-semibold">
          <Plus size={16} /> Yeni Pano
        </button>
      </div>

      {/* Pano sekmeleri */}
      {yukleniyor ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#999]" /></div>
      ) : panolar.length === 0 ? (
        <div className="text-center py-20 text-[#999] font-montserrat">
          Henüz pano yok. "Yeni Pano" ile başla.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
            {panolar.map(p => (
              <button key={p.id} onClick={() => setAktifPano(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-montserrat font-semibold whitespace-nowrap transition-colors ${aktifPano === p.id ? 'bg-[#1a1a1a] text-white' : 'bg-white border border-[#eaeaea] text-[#555] hover:bg-[#f8f9fa]'}`}>
                {p.ad} <span className="opacity-60">({p._count.gorevler})</span>
              </button>
            ))}
          </div>

          {secilenPano && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-montserrat text-[#999]">{secilenPano.ad}</span>
              <button onClick={() => panoSil(secilenPano.id)} className="text-xs text-red-500 font-montserrat flex items-center gap-1">
                <Trash2 size={12} /> Panoyu Sil
              </button>
            </div>
          )}

          <div className="flex justify-end mb-3">
            <button onClick={() => setYeniGorevAcik(true)}
              className="flex items-center gap-2 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] px-4 py-2 rounded-xl text-sm font-montserrat font-semibold">
              <Plus size={14} /> Görev Ekle
            </button>
          </div>

          {/* Kanban sütunları */}
          {gorevYukleniyor ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#999]" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SUTUNLAR.map(sutun => (
                <div key={sutun.deger} className="bg-[#f8f9fa] rounded-xl p-3 min-h-[200px]">
                  <h3 className="font-montserrat font-bold text-xs text-[#777] uppercase mb-3 px-1">
                    {sutun.etiket} ({gorevler.filter(g => g.durum === sutun.deger).length})
                  </h3>
                  <div className="space-y-2">
                    {gorevler.filter(g => g.durum === sutun.deger).map(g => (
                      <div key={g.id} className="bg-white border border-[#eaeaea] rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="font-montserrat font-semibold text-sm text-[#1a1a1a]">{g.baslik}</p>
                          <button onClick={() => gorevSil(g.id)} className="text-[#ccc] hover:text-red-500 flex-shrink-0"><X size={14} /></button>
                        </div>
                        {g.aciklama && <p className="text-xs text-[#777] font-montserrat mb-2">{g.aciklama}</p>}
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-montserrat font-semibold ${ONCELIK_RENK[g.oncelik]}`}>
                            <Flag size={9} className="inline mr-0.5 -mt-0.5" />{ONCELIK_ETIKET[g.oncelik]}
                          </span>
                          {g.musteri && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-montserrat font-semibold">
                              <Building2 size={9} className="inline mr-0.5 -mt-0.5" />{g.musteri.firmaAdi}
                            </span>
                          )}
                          {g.sonTarih && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-montserrat font-semibold">
                              <Calendar size={9} className="inline mr-0.5 -mt-0.5" />{new Date(g.sonTarih).toLocaleDateString('tr-TR')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-[#999] font-montserrat flex items-center gap-1">
                            <User size={10} />{g.atanan?.name || 'Atanmadı'}
                          </span>
                          <select value={g.durum} onChange={e => durumDegistir(g.id, e.target.value)}
                            className="text-[11px] border border-[#eaeaea] rounded-lg px-1.5 py-1 font-montserrat text-[#555] focus:outline-none">
                            {SUTUNLAR.map(s => <option key={s.deger} value={s.deger}>{s.etiket}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Yeni Pano modal */}
      {yeniPanoAcik && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-montserrat font-bold text-[#1a1a1a]">Yeni Pano</h3>
              <button onClick={() => setYeniPanoAcik(false)}><X size={18} className="text-[#999]" /></button>
            </div>
            <input placeholder="Pano adı (örn: İçerik Takvimi)" value={yeniPanoAdi} onChange={e => setYeniPanoAdi(e.target.value)}
              className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a] mb-3" />
            <button onClick={panoOlustur} className="w-full bg-[#1a1a1a] text-white font-montserrat font-bold text-sm py-3 rounded-xl">
              Oluştur
            </button>
          </div>
        </div>
      )}

      {/* Yeni Görev modal */}
      {yeniGorevAcik && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-montserrat font-bold text-[#1a1a1a]">Yeni Görev</h3>
              <button onClick={gorevFormuSifirla}><X size={18} className="text-[#999]" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Görev başlığı" value={gBaslik} onChange={e => setGBaslik(e.target.value)}
                className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a]" />
              <textarea placeholder="Açıklama (opsiyonel)" value={gAciklama} onChange={e => setGAciklama(e.target.value)} rows={2}
                className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a] resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={gOncelik} onChange={e => setGOncelik(e.target.value)}
                  className="border-2 border-[#eaeaea] rounded-xl px-3 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a]">
                  <option value="dusuk">Düşük Öncelik</option>
                  <option value="normal">Normal Öncelik</option>
                  <option value="yuksek">Yüksek Öncelik</option>
                </select>
                <input type="date" value={gSonTarih} onChange={e => setGSonTarih(e.target.value)}
                  className="border-2 border-[#eaeaea] rounded-xl px-3 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a]" />
              </div>
              <select value={gAtanan} onChange={e => setGAtanan(e.target.value)}
                className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a]">
                <option value="">Kime atanacak? (opsiyonel)</option>
                {ekip.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
              <select value={gMusteri} onChange={e => setGMusteri(e.target.value)}
                className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a]">
                <option value="">Hangi müşteri için? (opsiyonel)</option>
                {musteriler.map(m => <option key={m.id} value={m.id}>{m.firmaAdi}</option>)}
              </select>
              <button onClick={gorevOlustur} disabled={kaydediliyor || !gBaslik.trim()}
                className="w-full bg-[#1a1a1a] text-white font-montserrat font-bold text-sm py-3 rounded-xl disabled:opacity-50">
                {kaydediliyor ? 'Kaydediliyor...' : 'Görevi Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
