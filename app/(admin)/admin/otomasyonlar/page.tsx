"use client"
import { useEffect, useState } from 'react'
import { Plus, X, Loader2, Zap, Trash2, Power } from 'lucide-react'

type Otomasyon = {
  id: string
  ad: string
  tetikleyici: string
  departman: string
  mesaj: string
  aktif: boolean
  sonCalisma: string | null
  calismaSayisi: number
}

const TETIKLEYICILER = [
  { deger: 'gorev_atandi', etiket: 'Bir göreve kişi atandığında' },
  { deger: 'gorev_tamamlandi', etiket: 'Bir görev tamamlandığında' },
]

const DEPARTMANLAR = [
  { deger: 'tumu', etiket: 'Tüm Departmanlar' },
  { deger: 'yonetim', etiket: 'Yönetim' },
  { deger: 'satis', etiket: 'Satış' },
  { deger: 'sosyal_medya', etiket: 'Sosyal Medya' },
  { deger: 'reklam', etiket: 'Reklam (Paid Ads)' },
  { deger: 'creative', etiket: 'Creative (Viral İçerik)' },
  { deger: 'video_produksiyon', etiket: 'Video Prodüksiyon' },
  { deger: 'muhasebe', etiket: 'Muhasebe' },
  { deger: 'tasarim', etiket: 'Tasarım / Kreatif' },
]

const tetikEtiket = (d: string) => TETIKLEYICILER.find(t => t.deger === d)?.etiket || d
const depEtiket = (d: string) => DEPARTMANLAR.find(t => t.deger === d)?.etiket || d

export default function OtomasyonlarPage() {
  const [liste, setListe] = useState<Otomasyon[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [yeniAcik, setYeniAcik] = useState(false)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [hata, setHata] = useState('')

  const [ad, setAd] = useState('')
  const [tetikleyici, setTetikleyici] = useState('gorev_atandi')
  const [departman, setDepartman] = useState('tumu')
  const [mesaj, setMesaj] = useState('Merhaba {isim}, sana yeni bir görev atandı: "{gorevBaslik}" ({panoAdi}).')

  const veriGetir = () => {
    setYukleniyor(true)
    fetch('/api/otomasyonlar')
      .then(res => res.json())
      .then(data => setListe(data.data || []))
      .finally(() => setYukleniyor(false))
  }
  useEffect(() => { veriGetir() }, [])

  const olustur = async () => {
    if (!ad.trim() || !mesaj.trim()) return
    setKaydediliyor(true)
    setHata('')
    try {
      const res = await fetch('/api/otomasyonlar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad, tetikleyici, departman, mesaj }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Hata oluştu') }
      setAd(''); setMesaj('Merhaba {isim}, sana yeni bir görev atandı: "{gorevBaslik}" ({panoAdi}).')
      setYeniAcik(false)
      veriGetir()
    } catch (e: any) {
      setHata(e.message)
    } finally {
      setKaydediliyor(false)
    }
  }

  const aktifligiDegistir = async (o: Otomasyon) => {
    await fetch(`/api/otomasyonlar/${o.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aktif: !o.aktif }),
    })
    veriGetir()
  }

  const sil = async (o: Otomasyon) => {
    if (!confirm(`"${o.ad}" otomasyonu silinsin mi?`)) return
    await fetch(`/api/otomasyonlar/${o.id}`, { method: 'DELETE' })
    veriGetir()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-[#1a1a1a]" />
          <h2 className="font-montserrat font-bold text-lg text-[#1a1a1a]">Otomasyonlar</h2>
        </div>
        <button onClick={() => setYeniAcik(true)}
          className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2.5 rounded-xl text-sm font-montserrat font-semibold">
          <Plus size={16} /> Yeni Otomasyon
        </button>
      </div>
      <p className="text-xs text-[#999] font-montserrat mb-5">
        "Eğer X olursa, WhatsApp'tan şunu gönder" kuralları. Not: WhatsApp serbest metin ancak kişi size son 24 saat içinde mesaj attıysa gider — değilse başarısız loglanır, onaylı şablon gerekir.
      </p>

      {yukleniyor ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#999]" /></div>
      ) : liste.length === 0 ? (
        <div className="text-center py-16 text-[#999] font-montserrat text-sm">Henüz otomasyon yok.</div>
      ) : (
        <div className="space-y-3">
          {liste.map(o => (
            <div key={o.id} className="bg-white border border-[#eaeaea] rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-montserrat font-bold text-[#1a1a1a] text-sm">{o.ad}</p>
                  <p className="text-xs text-[#777] font-montserrat mt-0.5">
                    <span className="font-semibold">EĞER</span> {tetikEtiket(o.tetikleyici)} <span className="font-semibold">({depEtiket(o.departman)})</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => aktifligiDegistir(o)} title={o.aktif ? 'Pasifleştir' : 'Aktifleştir'}
                    className={`p-1.5 rounded-lg ${o.aktif ? 'bg-green-50 text-green-600' : 'bg-[#f0f0f0] text-[#999]'}`}>
                    <Power size={14} />
                  </button>
                  <button onClick={() => sil(o)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="bg-[#f8f9fa] rounded-lg px-3 py-2 text-xs text-[#555] font-montserrat italic">
                "{o.mesaj}"
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-[#999] font-montserrat">
                <span className={o.aktif ? 'text-green-600 font-semibold' : 'text-[#999]'}>{o.aktif ? '● Aktif' : '○ Pasif'}</span>
                <span>{o.calismaSayisi} kez çalıştı</span>
                {o.sonCalisma && <span>Son: {new Date(o.sonCalisma).toLocaleString('tr-TR')}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {yeniAcik && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-montserrat font-bold text-[#1a1a1a]">Yeni Otomasyon</h3>
              <button onClick={() => setYeniAcik(false)}><X size={18} className="text-[#999]" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Otomasyon adı (örn: Görev Atama Bildirimi)" value={ad} onChange={e => setAd(e.target.value)}
                className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a]" />
              <div>
                <label className="text-xs font-montserrat text-[#777] font-semibold">EĞER</label>
                <select value={tetikleyici} onChange={e => setTetikleyici(e.target.value)}
                  className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a] mt-1">
                  {TETIKLEYICILER.map(t => <option key={t.deger} value={t.deger}>{t.etiket}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-montserrat text-[#777] font-semibold">HANGİ DEPARTMANDA</label>
                <select value={departman} onChange={e => setDepartman(e.target.value)}
                  className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a] mt-1">
                  {DEPARTMANLAR.map(d => <option key={d.deger} value={d.deger}>{d.etiket}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-montserrat text-[#777] font-semibold">O ZAMAN BU MESAJI WHATSAPP'TAN GÖNDER</label>
                <textarea value={mesaj} onChange={e => setMesaj(e.target.value)} rows={3}
                  className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a] resize-none mt-1" />
                <p className="text-[10px] text-[#999] font-montserrat mt-1">Kullanılabilir değişkenler: {'{isim}'}, {'{gorevBaslik}'}, {'{panoAdi}'}</p>
              </div>
              {hata && <p className="text-red-500 text-xs font-montserrat">{hata}</p>}
              <button onClick={olustur} disabled={kaydediliyor || !ad.trim() || !mesaj.trim()}
                className="w-full bg-[#1a1a1a] text-white font-montserrat font-bold text-sm py-3 rounded-xl disabled:opacity-50">
                {kaydediliyor ? 'Kaydediliyor...' : 'Otomasyonu Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
