"use client"
import { useEffect, useState } from 'react'
import { Calendar, Clock, Check, Copy } from 'lucide-react'

function tarihStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function gunEtiketi(tarih: string): string {
  const d = new Date(tarih + 'T00:00:00')
  const etiket = d.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })
  return etiket.charAt(0).toUpperCase() + etiket.slice(1)
}

// Seçim için gösterilecek aday günler: bugünden itibaren 30 gün
function adayGunler(): string[] {
  const gunler: string[] = []
  const bugun = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(bugun)
    d.setDate(bugun.getDate() + i)
    gunler.push(tarihStr(d))
  }
  return gunler
}

export default function RandevuAyarlariPage() {
  const [seciliGunler, setSeciliGunler] = useState<string[]>([])
  const [baslangicSaat, setBaslangicSaat] = useState('09:00')
  const [bitisSaat, setBitisSaat] = useState('18:00')
  const [slotDakika, setSlotDakika] = useState(30)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [kaydedildi, setKaydedildi] = useState(false)
  const [kopyalandi, setKopyalandi] = useState(false)

  useEffect(() => {
    fetch('/api/randevu-ayar')
      .then(res => res.json())
      .then(data => {
        setSeciliGunler(data.gunler || [])
        setBaslangicSaat(data.baslangicSaat || '09:00')
        setBitisSaat(data.bitisSaat || '18:00')
        setSlotDakika(data.slotDakika || 30)
      })
      .finally(() => setYukleniyor(false))
  }, [])

  const gunToggle = (gun: string) => {
    setSeciliGunler(prev => (prev.includes(gun) ? prev.filter(g => g !== gun) : [...prev, gun].sort()))
    setKaydedildi(false)
  }

  const kaydet = async () => {
    setKaydediliyor(true)
    setKaydedildi(false)
    try {
      const res = await fetch('/api/randevu-ayar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gunler: seciliGunler, baslangicSaat, bitisSaat, slotDakika }),
      })
      if (res.ok) setKaydedildi(true)
    } finally {
      setKaydediliyor(false)
    }
  }

  const linkiKopyala = () => {
    navigator.clipboard.writeText('https://404dijital.com/gorusme')
    setKopyalandi(true)
    setTimeout(() => setKopyalandi(false), 2000)
  }

  if (yukleniyor) {
    return <p className="text-sm text-[#999] font-montserrat">Yükleniyor...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider">RANDEVU AYARLARI</h2>
        <button
          onClick={linkiKopyala}
          className="flex items-center gap-2 text-sm font-montserrat font-semibold text-[#555] border border-[#eaeaea] rounded-xl px-4 py-2 hover:bg-[#f8f9fa] transition-colors"
        >
          {kopyalandi ? <Check size={14} /> : <Copy size={14} />}
          {kopyalandi ? 'Kopyalandı' : 'Görüşme linkini kopyala'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
        <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a] mb-1 flex items-center gap-2">
          <Calendar size={18} /> GÖRÜŞME GÜNLERİ
        </h3>
        <p className="text-xs text-[#999] font-montserrat mb-4">
          Hangi günlerde görüşme yapılabileceğini seç. Adaylar sadece buradan işaretlediğin günleri görür.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {adayGunler().map(gun => {
            const secili = seciliGunler.includes(gun)
            return (
              <button
                key={gun}
                onClick={() => gunToggle(gun)}
                className={`py-2.5 rounded-xl text-xs font-montserrat font-semibold border transition-colors ${
                  secili
                    ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                    : 'border-[#eaeaea] text-[#555] hover:border-[#1a1a1a]'
                }`}
              >
                {gunEtiketi(gun)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
        <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a] mb-1 flex items-center gap-2">
          <Clock size={18} /> MESAİ SAATLERİ
        </h3>
        <p className="text-xs text-[#999] font-montserrat mb-4">Seçtiğin günlerde hangi saat aralığında slot açılsın.</p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-montserrat font-bold text-[#555] mb-1.5 uppercase tracking-wide">Başlangıç</label>
            <input
              type="time"
              value={baslangicSaat}
              onChange={e => { setBaslangicSaat(e.target.value); setKaydedildi(false) }}
              className="border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-montserrat font-bold text-[#555] mb-1.5 uppercase tracking-wide">Bitiş</label>
            <input
              type="time"
              value={bitisSaat}
              onChange={e => { setBitisSaat(e.target.value); setKaydedildi(false) }}
              className="border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-montserrat font-bold text-[#555] mb-1.5 uppercase tracking-wide">Görüşme Süresi</label>
            <select
              value={slotDakika}
              onChange={e => { setSlotDakika(Number(e.target.value)); setKaydedildi(false) }}
              className="border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
            >
              <option value={15}>15 dakika</option>
              <option value={30}>30 dakika</option>
              <option value={45}>45 dakika</option>
              <option value={60}>60 dakika</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={kaydet}
          disabled={kaydediliyor || seciliGunler.length === 0}
          className="bg-[#1a1a1a] text-white rounded-xl px-6 py-3 text-sm font-montserrat font-bold disabled:opacity-40"
        >
          {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        {kaydedildi && (
          <span className="flex items-center gap-1.5 text-sm font-montserrat text-green-600">
            <Check size={16} /> Kaydedildi, link güncel
          </span>
        )}
        {seciliGunler.length === 0 && (
          <span className="text-xs font-montserrat text-red-500">En az bir gün seçmelisin.</span>
        )}
      </div>
    </div>
  )
}
