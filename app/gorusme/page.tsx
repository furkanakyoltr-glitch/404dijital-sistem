"use client"
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar, Clock, Check, Loader2 } from 'lucide-react'

function gunEtiketi(tarih: string): string {
  const d = new Date(tarih + 'T00:00:00')
  const etiket = d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })
  return etiket.charAt(0).toUpperCase() + etiket.slice(1)
}

function RandevuForm() {
  const params = useSearchParams()
  const [adaySoyad, setAdaySoyad] = useState(params.get('ad') || '')
  const [telefon, setTelefon] = useState(params.get('tel') || '')
  const pozisyon = params.get('pozisyon') || ''
  const [gunler, setGunler] = useState<string[]>([])
  const [saatler, setSaatler] = useState<string[]>([])
  const [doluSlotlar, setDoluSlotlar] = useState<string[]>([])
  const [seciliSlot, setSeciliSlot] = useState<string | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [hata, setHata] = useState('')
  const [tamamlandi, setTamamlandi] = useState<{ tarih: string; saat: string } | null>(null)

  const veriGetir = () => {
    fetch('/api/randevu')
      .then(res => res.json())
      .then(data => {
        setGunler(data.gunler || [])
        setSaatler(data.saatler || [])
        setDoluSlotlar(data.doluSlotlar || [])
      })
      .finally(() => setYukleniyor(false))
  }

  useEffect(() => { veriGetir() }, [])

  const gonder = async () => {
    if (!adaySoyad.trim() || !telefon.trim() || !seciliSlot) return
    setGonderiliyor(true)
    setHata('')
    const [tarih, saat] = seciliSlot.split('_')
    try {
      const res = await fetch('/api/randevu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarih, saat, adaySoyad, telefon, pozisyon: pozisyon || undefined }),
      })
      const data = await res.json()
      if (data.success) {
        setTamamlandi({ tarih, saat })
      } else {
        setHata(data.error || 'Bir şeyler ters gitti, tekrar deneyin.')
        setSeciliSlot(null)
        veriGetir()
      }
    } catch {
      setHata('Bağlantı hatası, tekrar deneyin.')
    } finally {
      setGonderiliyor(false)
    }
  }

  if (tamamlandi) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <div className="w-14 h-14 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-5">
          <Check size={24} className="text-white" />
        </div>
        <h1 className="font-bebas text-3xl tracking-wider text-[#1a1a1a] mb-2">RANDEVUNUZ ALINDI</h1>
        <p className="font-montserrat text-sm text-[#555] mb-1">
          {gunEtiketi(tamamlandi.tarih)} günü saat {tamamlandi.saat}
        </p>
        <p className="font-montserrat text-xs text-[#999] mt-4">
          Görüşme için ofisimize bekliyoruz. Değişiklik olursa size WhatsApp üzerinden ulaşacağız.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-5 py-10">
      <h1 className="font-bebas text-3xl tracking-wider text-[#1a1a1a] mb-1">GÖRÜŞME RANDEVUSU</h1>
      <p className="font-montserrat text-sm text-[#666] mb-7">
        404 Dijital — {pozisyon ? `${pozisyon} pozisyonu` : 'Görüşme'} için size uygun gün ve saati seçin.
      </p>

      <div className="space-y-4 mb-7">
        <div>
          <label className="block text-xs font-montserrat font-bold text-[#555] mb-1.5 uppercase tracking-wide">Ad Soyad</label>
          <input
            value={adaySoyad}
            onChange={e => setAdaySoyad(e.target.value)}
            placeholder="Adınız soyadınız"
            className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
          />
        </div>
        <div>
          <label className="block text-xs font-montserrat font-bold text-[#555] mb-1.5 uppercase tracking-wide">Telefon</label>
          <input
            value={telefon}
            onChange={e => setTelefon(e.target.value)}
            placeholder="05xx xxx xx xx"
            className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
          />
        </div>
      </div>

      {yukleniyor ? (
        <div className="flex items-center justify-center py-14 text-[#999]">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {gunler.map(gun => (
            <div key={gun}>
              <div className="flex items-center gap-2 mb-2.5">
                <Calendar size={14} className="text-[#999]" />
                <p className="font-montserrat font-bold text-sm text-[#1a1a1a]">{gunEtiketi(gun)}</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {saatler.map(saat => {
                  const slotId = `${gun}_${saat}`
                  const dolu = doluSlotlar.includes(slotId)
                  const secili = seciliSlot === slotId
                  return (
                    <button
                      key={slotId}
                      disabled={dolu}
                      onClick={() => setSeciliSlot(secili ? null : slotId)}
                      className={`flex items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-montserrat font-semibold border transition-colors ${
                        dolu
                          ? 'border-[#eaeaea] text-[#ccc] bg-[#fafafa] cursor-not-allowed line-through'
                          : secili
                          ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                          : 'border-[#eaeaea] text-[#333] hover:border-[#1a1a1a]'
                      }`}
                    >
                      <Clock size={11} /> {saat}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {hata && <p className="text-xs text-red-500 font-montserrat mt-4">{hata}</p>}

      <button
        onClick={gonder}
        disabled={!adaySoyad.trim() || !telefon.trim() || !seciliSlot || gonderiliyor}
        className="w-full mt-7 bg-[#1a1a1a] text-white rounded-xl py-3.5 text-sm font-montserrat font-bold disabled:opacity-30 flex items-center justify-center gap-2"
      >
        {gonderiliyor ? <Loader2 size={16} className="animate-spin" /> : 'Randevuyu Onayla'}
      </button>

      <p className="text-center text-[10px] text-[#999] font-montserrat mt-4">
        Bu 3 gün size uygun değilse, mesaj attığımız WhatsApp hattından bize yazabilirsiniz.
      </p>
    </div>
  )
}

export default function GorusmePage() {
  return (
    <Suspense fallback={null}>
      <RandevuForm />
    </Suspense>
  )
}
