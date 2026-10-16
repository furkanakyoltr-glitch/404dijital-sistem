"use client"
import { useEffect, useMemo, useState } from 'react'
import { Plus, Send, Trash2, Loader2, X, Users, Phone, RefreshCw, ChevronDown } from 'lucide-react'

type Degisken = { etiket: string; kaynak: string }
type Sablon = {
  id: string
  baslik: string
  kategori: string
  metaTemplateName: string
  parametreler: Degisken[]
  onizlemeMetni: string | null
  govde: string | null
  metaDurum: string
  metaTemplateId: string | null
}

const DURUM_RENK: Record<string, string> = {
  mevcut: 'bg-[#f0f0f0] text-[#555]',
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}
const DURUM_METIN: Record<string, string> = {
  mevcut: 'Mevcut (manuel)',
  PENDING: 'Meta onayı bekleniyor',
  APPROVED: 'Onaylandı, gönderime hazır',
  REJECTED: 'Meta reddetti',
}
const KATEGORI_SECENEKLERI = ['Satış Mesajları', 'Görüşme Mesajları', 'Bilgilendirme', 'Genel']
const KAYNAK_SECENEKLERI = [
  { deger: 'adSoyad', etiket: 'Ad Soyad (lead kaydından)' },
  { deger: 'firmaAdi', etiket: 'Firma Adı (lead kaydından)' },
  { deger: 'email', etiket: 'E-posta (lead kaydından)' },
  { deger: '', etiket: 'Gönderirken elle gireceğim' },
]

function metindenDegiskenleriBul(metin: string): string[] {
  const bulunan: string[] = []
  const regex = /\[([^\]]+)\]/g
  let m
  while ((m = regex.exec(metin))) bulunan.push(m[1])
  return bulunan
}

export default function SablonlarPage() {
  const [sablonlar, setSablonlar] = useState<Sablon[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [yeniAcik, setYeniAcik] = useState(false)
  const [gonderAcik, setGonderAcik] = useState<Sablon | null>(null)

  const [baslik, setBaslik] = useState('')
  const [kategori, setKategori] = useState('Genel')
  const [metin, setMetin] = useState('')
  const [kaynaklar, setKaynaklar] = useState<Record<string, string>>({})
  const [ornekler, setOrnekler] = useState<Record<string, string>>({})
  const [gelismisAcik, setGelismisAcik] = useState(false)
  const [mevcutSablonAdi, setMevcutSablonAdi] = useState('')
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [kaydetHata, setKaydetHata] = useState('')

  const [hedef, setHedef] = useState<'tek' | 'tumu'>('tek')
  const [gonderTelefon, setGonderTelefon] = useState('')
  const [gonderIsim, setGonderIsim] = useState('')
  const [gonderParams, setGonderParams] = useState<string[]>([])
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [sonuc, setSonuc] = useState<any>(null)
  const [durumYenileniyor, setDurumYenileniyor] = useState<string | null>(null)

  const degiskenler = useMemo(() => Array.from(new Set(metindenDegiskenleriBul(metin))), [metin])

  const veriGetir = () => {
    setYukleniyor(true)
    fetch('/api/sablonlar')
      .then(res => res.json())
      .then(data => setSablonlar(data.sablonlar || []))
      .finally(() => setYukleniyor(false))
  }
  useEffect(() => { veriGetir() }, [])

  const formuSifirla = () => {
    setBaslik(''); setKategori('Genel'); setMetin(''); setKaynaklar({}); setOrnekler({})
    setGelismisAcik(false); setMevcutSablonAdi(''); setKaydetHata('')
  }

  const sablonKaydet = async () => {
    if (!baslik.trim()) return
    setKaydediliyor(true)
    setKaydetHata('')
    try {
      let gonderilecek: any
      if (gelismisAcik) {
        if (!mevcutSablonAdi.trim()) { setKaydetHata('Meta şablon adını gir'); setKaydediliyor(false); return }
        gonderilecek = {
          baslik, kategori, metaOlustur: false,
          metaTemplateName: mevcutSablonAdi,
          parametreler: degiskenler.map(d => ({ etiket: d, kaynak: kaynaklar[d] || '' })),
          onizlemeMetni: metin.replace(/\[([^\]]+)\]/g, (_, d) => ornekler[d] || d),
        }
      } else {
        if (!metin.trim()) { setKaydetHata('Mesaj metnini yaz'); setKaydediliyor(false); return }
        const eksikOrnek = degiskenler.find(d => !ornekler[d]?.trim())
        if (eksikOrnek) { setKaydetHata(`"${eksikOrnek}" için örnek değer gir (Meta onayı bunu istiyor)`); setKaydediliyor(false); return }
        let sayac = 0
        const govde = metin.replace(/\[([^\]]+)\]/g, () => `{{${++sayac}}}`)
        const ornekDegerler = degiskenler.map(d => ornekler[d])
        gonderilecek = {
          baslik, kategori, metaOlustur: true, metaKategori: 'MARKETING',
          govde, ornekDegerler,
          parametreler: degiskenler.map(d => ({ etiket: d, kaynak: kaynaklar[d] || '' })),
          onizlemeMetni: metin.replace(/\[([^\]]+)\]/g, (_, d) => ornekler[d] || d),
        }
      }

      const res = await fetch('/api/sablonlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gonderilecek),
      })
      const data = await res.json()
      if (!data.success) { setKaydetHata(data.error || 'Kaydedilemedi'); return }
      formuSifirla()
      setYeniAcik(false)
      veriGetir()
    } finally { setKaydediliyor(false) }
  }

  const sablonSil = async (id: string) => {
    if (!confirm('Bu şablonu silmek istediğinize emin misiniz?')) return
    await fetch(`/api/sablonlar/${id}`, { method: 'DELETE' })
    veriGetir()
  }

  const durumYenile = async (s: Sablon) => {
    setDurumYenileniyor(s.id)
    try {
      await fetch(`/api/sablonlar/${s.id}/durum`)
      veriGetir()
    } finally { setDurumYenileniyor(null) }
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
                  {s.onizlemeMetni && (
                    <p className="text-xs text-[#777] font-montserrat mb-2 line-clamp-2">{s.onizlemeMetni}</p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-montserrat font-bold px-2 py-1 rounded-full ${DURUM_RENK[s.metaDurum] || 'bg-[#f0f0f0] text-[#555]'}`}>
                      {DURUM_METIN[s.metaDurum] || s.metaDurum}
                    </span>
                    {s.metaTemplateId && (
                      <button onClick={() => durumYenile(s)} className="text-[#999] hover:text-[#1a1a1a]" title="Durumu Meta'dan yenile">
                        {durumYenileniyor === s.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => gonderimPenceresiniAc(s)}
                    disabled={s.metaDurum === 'PENDING' || s.metaDurum === 'REJECTED'}
                    className="w-full flex items-center justify-center gap-2 bg-[#f8f9fa] border border-[#eaeaea] rounded-lg py-2 text-xs font-montserrat font-bold text-[#1a1a1a] hover:bg-[#eee] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send size={13} /> {s.metaDurum === 'PENDING' ? 'Onay bekleniyor' : s.metaDurum === 'REJECTED' ? 'Reddedildi' : 'Gönder'}
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
              <button onClick={() => { setYeniAcik(false); formuSifirla() }}><X size={18} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-montserrat font-bold text-[#555] mb-1">Şablonun adı (sadece sen göreceksin)</label>
                <input value={baslik} onChange={e => setBaslik(e.target.value)} placeholder="örn. Fiyat Teklifi Hatırlatma" className="w-full border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat" />
              </div>

              <div>
                <label className="block text-xs font-montserrat font-bold text-[#555] mb-1">Kategori</label>
                <select value={kategori} onChange={e => setKategori(e.target.value)} className="w-full border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat">
                  {KATEGORI_SECENEKLERI.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              {!gelismisAcik && (
                <div>
                  <label className="block text-xs font-montserrat font-bold text-[#555] mb-1">WhatsApp mesajı</label>
                  <textarea
                    value={metin}
                    onChange={e => setMetin(e.target.value)}
                    placeholder={'Merhaba [İsim], teklifiniz hazır!\n\nKişiye özel bilgi eklemek için köşeli parantez kullan, örn: [İsim], [Firma]'}
                    className="w-full border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat"
                    rows={5}
                  />
                  <p className="text-[11px] text-[#999] font-montserrat mt-1">
                    [İsim] gibi yazdığın her şey, gönderirken gerçek bilgiyle otomatik değişir. Meta bu mesajı inceleyip onaylayacak (genelde birkaç dakika - birkaç saat).
                  </p>

                  {degiskenler.length > 0 && (
                    <div className="mt-3 space-y-3 bg-[#f8f9fa] rounded-xl p-3">
                      <p className="text-xs font-montserrat font-bold text-[#333]">Bulunan değişkenler:</p>
                      {degiskenler.map(d => (
                        <div key={d} className="space-y-1.5">
                          <p className="text-xs font-montserrat font-semibold text-[#1a1a1a]">[{d}]</p>
                          <select
                            value={kaynaklar[d] || ''}
                            onChange={e => setKaynaklar(prev => ({ ...prev, [d]: e.target.value }))}
                            className="w-full border border-[#eaeaea] rounded-lg px-3 py-2 text-xs font-montserrat bg-white"
                          >
                            {KAYNAK_SECENEKLERI.map(k => <option key={k.deger} value={k.deger}>{k.etiket}</option>)}
                          </select>
                          <input
                            value={ornekler[d] || ''}
                            onChange={e => setOrnekler(prev => ({ ...prev, [d]: e.target.value }))}
                            placeholder={`Meta onayı için örnek: örn. ${d === 'İsim' || d.toLowerCase().includes('isim') || d.toLowerCase().includes('ad') ? 'Ahmet' : 'Örnek Değer'}`}
                            className="w-full border border-[#eaeaea] rounded-lg px-3 py-2 text-xs font-montserrat"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setGelismisAcik(v => !v)}
                className="flex items-center gap-1 text-xs font-montserrat text-[#999] hover:text-[#555] pt-1"
              >
                <ChevronDown size={12} className={gelismisAcik ? 'rotate-180' : ''} />
                {gelismisAcik ? 'Yeni mesaj yazmaya geri dön' : 'Meta\'da zaten onaylı bir şablonum var'}
              </button>

              {gelismisAcik && (
                <div className="space-y-2">
                  <input value={mevcutSablonAdi} onChange={e => setMevcutSablonAdi(e.target.value)} placeholder="Meta Business Manager'daki onaylı şablon adı" className="w-full border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat" />
                  <p className="text-[11px] text-[#999] font-montserrat">Bu şablonun kaç değişkeni varsa, yukarıdaki mesaj kutusuna aynı sırayla [değişken] yazarak eşleştir.</p>
                </div>
              )}
            </div>

            {kaydetHata && <p className="text-xs text-red-500 font-montserrat mt-3">{kaydetHata}</p>}

            <button
              onClick={sablonKaydet}
              disabled={kaydediliyor || !baslik.trim()}
              className="w-full mt-5 bg-[#1a1a1a] text-white rounded-xl py-3 text-sm font-montserrat font-bold disabled:opacity-30"
            >
              {kaydediliyor ? <Loader2 size={16} className="animate-spin mx-auto" /> : gelismisAcik ? 'Kaydet' : 'Onaya Gönder'}
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
                    key={p.etiket + i}
                    value={gonderParams[i] || ''}
                    onChange={e => setGonderParams(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                    placeholder={`${p.etiket} değeri`}
                    className="w-full border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat"
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#999] font-montserrat mb-5">
                Telefon numarası kayıtlı olan tüm leadlere gönderilecek. Değişkenler ({gonderAcik.parametreler.map(p => p.etiket).join(', ') || 'yok'}) her lead için kendi kaydından otomatik doldurulur.
              </p>
            )}

            {sonuc && (
              <div className="mb-4 p-3 bg-[#f8f9fa] rounded-xl text-xs font-montserrat">
                {hedef === 'tek'
                  ? (sonuc.success ? '✅ Gönderildi.' : `❌ ${sonuc.sonuc?.hata || sonuc.error || 'Gönderilemedi'}`)
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
