"use client"
import { useEffect, useState } from 'react'
import { Plus, Send, Trash2, Loader2, X, Users, Phone } from 'lucide-react'

type Sablon = {
  id: string
  baslik: string
  kategori: string
  metaTemplateName: string
  parametreler: string[]
  onizlemeMetni: string | null
}

export default function SablonlarPage() {
  const [sablonlar, setSablonlar] = useState<Sablon[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [yeniAcik, setYeniAcik] = useState(false)
  const [gonderAcik, setGonderAcik] = useState<Sablon | null>(null)

  const [baslik, setBaslik] = useState('')
  const [kategori, setKategori] = useState('Genel')
  const [metaTemplateName, setMetaTemplateName] = useState('')
  const [parametreler, setParametreler] = useState('')
  const [onizlemeMetni, setOnizlemeMetni] = useState('')
  const [kaydediliyor, setKaydediliyor] = useState(false)

  const [hedef, setHedef] = useState<'tek' | 'tumu'>('tek')
  const [gonderTelefon, setGonderTelefon] = useState('')
  const [gonderIsim, setGonderIsim] = useState('')
  const [gonderParams, setGonderParams] = useState<string[]>([])
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [sonuc, setSonuc] = useState<any>(null)

  const veriGetir = () => {
    setYukleniyor(true)
    fetch('/api/sablonlar')
      .then(res => res.json())
      .then(data => setSablonlar(data.sablonlar || []))
      .finally(() => setYukleniyor(false))
  }
  useEffect(() => { veriGetir() }, [])

  const sablonKaydet = async () => {
    if (!baslik.trim() || !metaTemplateName.trim()) return
    setKaydediliyor(true)
    try {
      await fetch('/api/sablonlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baslik, kategori, metaTemplateName,
          parametreler: parametreler.split(',').map(p => p.trim()).filter(Boolean),
          onizlemeMetni,
        }),
      })
      setBaslik(''); setKategori('Genel'); setMetaTemplateName(''); setParametreler(''); setOnizlemeMetni('')
      setYeniAcik(false)
      veriGetir()
    } finally { setKaydediliyor(false) }
  }

  const sablonSil = async (id: string) => {
    if (!confirm('Bu şablonu silmek istediğinize emin misiniz?')) return
    await fetch(`/api/sablonlar/${id}`, { method: 'DELETE' })
    veriGetir()
  }

  const gonderimPenceresiniAc = (s: Sablon) => {
    setGonderAcik(s)
    setHedef('tek')
    setGonderTelefon(''); setGonderIsim('')
    setGonderParams(new Array(s.parametreler.length).fill(''))
    setSonuc(null)
  }

  const gonder = async () => {
    if (!gonderAcik) return
    setGonderiliyor(true)
    setSonuc(null)
    try {
      const res = await fetch('/api/whatsapp/toplu-gonder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sablonId: gonderAcik.id,
          hedef,
          telefon: hedef === 'tek' ? gonderTelefon : undefined,
          isim: hedef === 'tek' ? gonderIsim : undefined,
          parametreDegerleri: hedef === 'tek' ? gonderParams : undefined,
        }),
      })
      const data = await res.json()
      setSonuc(data)
    } finally { setGonderiliyor(false) }
  }

  const kategoriler = Array.from(new Set(sablonlar.map(s => s.kategori)))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="font-montserrat text-sm text-[#666]">Hazır WhatsApp şablonlarını yönetin, tek numaraya veya kayıtlı tüm leadlere toplu gönderim yapın.</p>
        <button
          onClick={() => setYeniAcik(true)}
          className="flex items-center gap-2 bg-[#1a1a1a] text-white rounded-xl px-4 py-2.5 text-sm font-montserrat font-bold"
        >
          <Plus size={16} /> Yeni Şablon
        </button>
      </div>

      {yukleniyor ? (
        <div className="flex items-center justify-center py-20 text-[#999]"><Loader2 size={20} className="animate-spin" /></div>
      ) : sablonlar.length === 0 ? (
        <p className="text-sm text-[#999] font-montserrat text-center py-20">Henüz şablon eklenmemiş.</p>
      ) : (
        kategoriler.map(kat => (
          <div key={kat} className="mb-8">
            <h2 className="font-bebas text-lg tracking-wide text-[#1a1a1a] mb-3">{kat.toUpperCase()}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sablonlar.filter(s => s.kategori === kat).map(s => (
                <div key={s.id} className="border border-[#eaeaea] rounded-xl p-4 bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-montserrat font-bold text-sm text-[#1a1a1a]">{s.baslik}</p>
                    <button onClick={() => sablonSil(s.id)} className="text-[#ccc] hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                  <p className="text-xs text-[#999] font-montserrat mb-1">Meta şablon: {s.metaTemplateName}</p>
                  {s.parametreler.length > 0 && (
                    <p className="text-xs text-[#999] font-montserrat mb-3">Parametreler: {s.parametreler.join(', ')}</p>
                  )}
                  <button
                    onClick={() => gonderimPenceresiniAc(s)}
                    className="w-full flex items-center justify-center gap-2 bg-[#f8f9fa] border border-[#eaeaea] rounded-lg py-2 text-xs font-montserrat font-bold text-[#1a1a1a] hover:bg-[#eee]"
                  >
                    <Send size={13} /> Gönder
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {yeniAcik && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bebas text-xl tracking-wide">YENİ ŞABLON</h2>
              <button onClick={() => setYeniAcik(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input value={baslik} onChange={e => setBaslik(e.target.value)} placeholder="Başlık (örn. Fiyat Teklifi Hatırlatma)" className="w-full border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat" />
              <input value={kategori} onChange={e => setKategori(e.target.value)} placeholder="Kategori (örn. Satış Mesajları, Görüşme Mesajları)" className="w-full border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat" />
              <input value={metaTemplateName} onChange={e => setMetaTemplateName(e.target.value)} placeholder="Meta onaylı şablon adı (örn. teklif_bildirimi)" className="w-full border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat" />
              <input value={parametreler} onChange={e => setParametreler(e.target.value)} placeholder="Parametreler, virgülle (örn. adSoyad,firmaAdi)" className="w-full border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat" />
              <textarea value={onizlemeMetni} onChange={e => setOnizlemeMetni(e.target.value)} placeholder="Önizleme metni (mesaj kutusunda gösterilecek, opsiyonel)" className="w-full border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat" rows={2} />
              <p className="text-[11px] text-[#999] font-montserrat">Toplu gönderimde "tüm leadlere" seçilirse parametreler Lead tablosundaki alan adlarıyla eşleşmeli (adSoyad, firmaAdi, email vb).</p>
            </div>
            <button
              onClick={sablonKaydet}
              disabled={kaydediliyor || !baslik.trim() || !metaTemplateName.trim()}
              className="w-full mt-5 bg-[#1a1a1a] text-white rounded-xl py-3 text-sm font-montserrat font-bold disabled:opacity-30"
            >
              {kaydediliyor ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

      {gonderAcik && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bebas text-xl tracking-wide">GÖNDER: {gonderAcik.baslik.toUpperCase()}</h2>
              <button onClick={() => setGonderAcik(null)}><X size={18} /></button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setHedef('tek')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-montserrat font-bold border ${hedef === 'tek' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-[#eaeaea] text-[#555]'}`}
              >
                <Phone size={14} /> Tek Numara
              </button>
              <button
                onClick={() => setHedef('tumu')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-montserrat font-bold border ${hedef === 'tumu' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-[#eaeaea] text-[#555]'}`}
              >
                <Users size={14} /> Kayıtlı Herkes
              </button>
            </div>

            {hedef === 'tek' ? (
              <div className="space-y-3 mb-5">
                <input value={gonderTelefon} onChange={e => setGonderTelefon(e.target.value)} placeholder="Telefon (05xx xxx xx xx)" className="w-full border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat" />
                <input value={gonderIsim} onChange={e => setGonderIsim(e.target.value)} placeholder="İsim (opsiyonel, kayıt için)" className="w-full border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat" />
                {gonderAcik.parametreler.map((p, i) => (
                  <input
                    key={p}
                    value={gonderParams[i] || ''}
                    onChange={e => setGonderParams(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                    placeholder={`${p} değeri`}
                    className="w-full border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat"
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#999] font-montserrat mb-5">
                Telefon numarası kayıtlı olan tüm leadlere gönderilecek. Parametreler ({gonderAcik.parametreler.join(', ') || 'yok'}) her lead için kendi kaydındaki alanlardan otomatik doldurulur.
              </p>
            )}

            {sonuc && (
              <div className="mb-4 p-3 bg-[#f8f9fa] rounded-xl text-xs font-montserrat">
                {hedef === 'tek'
                  ? (sonuc.success ? '✅ Gönderildi.' : `❌ ${sonuc.error || 'Gönderilemedi'}`)
                  : `Toplam ${sonuc.toplam ?? 0}, başarılı ${sonuc.basarili ?? 0}, başarısız ${sonuc.basarisiz ?? 0}`}
              </div>
            )}

            <button
              onClick={gonder}
              disabled={gonderiliyor || (hedef === 'tek' && !gonderTelefon.trim())}
              className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] text-white rounded-xl py-3 text-sm font-montserrat font-bold disabled:opacity-30"
            >
              {gonderiliyor ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Gönder</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
