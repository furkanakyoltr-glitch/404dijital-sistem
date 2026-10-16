"use client"
import { useEffect, useState } from 'react'
import { Phone, PhoneIncoming, Loader2, Play } from 'lucide-react'

type ArmaKaydi = {
  id: string
  callSid: string
  kimden: string
  kime: string
  marka: string
  durum: string
  sureSaniye: number | null
  kayitUrl: string | null
  createdAt: string
}

const DURUM_RENK: Record<string, string> = {
  basladi: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  'no-answer': 'bg-[#f0f0f0] text-[#555]',
  busy: 'bg-[#f0f0f0] text-[#555]',
  failed: 'bg-red-100 text-red-700',
}
const DURUM_METIN: Record<string, string> = {
  basladi: 'Devam ediyor / yanıtsız',
  completed: 'Tamamlandı',
  'no-answer': 'Cevapsız',
  busy: 'Meşgul',
  failed: 'Başarısız',
}

function sureFormat(saniye: number | null): string {
  if (!saniye) return '-'
  const dk = Math.floor(saniye / 60)
  const sn = saniye % 60
  return `${dk}:${sn.toString().padStart(2, '0')}`
}

export default function AramalarPage() {
  const [aramalar, setAramalar] = useState<ArmaKaydi[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    fetch('/api/aramalar')
      .then(res => res.json())
      .then(data => setAramalar(data.aramalar || []))
      .finally(() => setYukleniyor(false))
  }, [])

  return (
    <div>
      <p className="font-montserrat text-sm text-[#666] mb-6">
        Spok.mp4 test numarasına gelen aramalar — hepsi kaydediliyor, panelden dinleyebilirsin.
      </p>

      {yukleniyor ? (
        <div className="flex items-center justify-center py-20 text-[#999]"><Loader2 size={20} className="animate-spin" /></div>
      ) : aramalar.length === 0 ? (
        <div className="text-center py-20">
          <PhoneIncoming size={32} className="mx-auto text-[#ccc] mb-3" />
          <p className="text-sm text-[#999] font-montserrat">Henüz arama gelmedi.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {aramalar.map(a => (
            <div key={a.id} className="border border-[#eaeaea] rounded-xl p-4 bg-white flex items-center gap-4">
              <div className="w-9 h-9 bg-[#f8f9fa] rounded-full flex items-center justify-center flex-shrink-0">
                <Phone size={16} className="text-[#555]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-montserrat font-bold text-sm text-[#1a1a1a]">{a.kimden}</p>
                <p className="text-xs text-[#999] font-montserrat">
                  {new Date(a.createdAt).toLocaleString('tr-TR')} · {sureFormat(a.sureSaniye)} · {a.marka}
                </p>
              </div>
              <span className={`text-[10px] font-montserrat font-bold px-2 py-1 rounded-full flex-shrink-0 ${DURUM_RENK[a.durum] || 'bg-[#f0f0f0] text-[#555]'}`}>
                {DURUM_METIN[a.durum] || a.durum}
              </span>
              {a.kayitUrl ? (
                <audio controls src={`/api/telefon/dinle/${a.id}`} className="h-8 flex-shrink-0" style={{ maxWidth: 220 }} />
              ) : (
                <span className="text-xs text-[#ccc] font-montserrat flex items-center gap-1 flex-shrink-0"><Play size={12} /> Kayıt yok</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
