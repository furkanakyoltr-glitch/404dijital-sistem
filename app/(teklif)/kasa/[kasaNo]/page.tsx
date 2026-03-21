"use client"
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CheckCircle, MessageCircle, Download, ArrowLeft, Lock } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface TeklifDetay {
  id: string
  teklifNo: string
  firmaAdi: string
  yetkiliKisi: string
  paketAdi: string
  paketKategori: string
  paketDetay: string
  islerListesi: { is: string; tamamlandi: boolean }[]
  ekGiderler: { aciklama: string; tutar: number }[]
  fiyat: number
  indirim: number
  kdvOrani: number
  toplam: number
  durum: string
  gecerlilikTarihi: string
  createdAt: string
}

export default function TeklifDetayPage() {
  const { kasaNo } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [teklif, setTeklif] = useState<TeklifDetay | null>(null)
  const [loading, setLoading] = useState(true)
  const [onayLoading, setOnayLoading] = useState(false)
  const [onaylandi, setOnaylandi] = useState(false)

  useEffect(() => {
    fetchTeklif()
  }, [kasaNo])

  const fetchTeklif = async () => {
    try {
      const res = await fetch(`/api/teklif/${kasaNo}`)
      if (!res.ok) throw new Error('Bulunamadı')
      const data = await res.json()
      setTeklif(data)
      if (data.durum === 'onaylandi') setOnaylandi(true)
    } catch {
      // Demo
      setTeklif({
        id: '1',
        teklifNo: kasaNo as string,
        firmaAdi: 'Demo Firma A.Ş.',
        yetkiliKisi: 'Ahmet Yılmaz',
        paketAdi: 'Gold Paket',
        paketKategori: 'Ciro Artırma',
        paketDetay: 'Aylık kapsamlı dijital pazarlama paketi',
        islerListesi: [
          { is: 'Facebook & Instagram reklam yönetimi', tamamlandi: false },
          { is: '8 Reels videosu prodüksiyon', tamamlandi: false },
          { is: 'Aylık performans raporu', tamamlandi: false },
        ],
        ekGiderler: [],
        fiyat: 50000,
        indirim: 0,
        kdvOrani: 20,
        toplam: 60000,
        durum: 'bekliyor',
        gecerlilikTarihi: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOnayla = async () => {
    if (!teklif) return
    setOnayLoading(true)
    try {
      const res = await fetch('/api/teklif/onayla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kasaNo }),
      })
      if (res.ok) {
        setOnaylandi(true)
        setTeklif(prev => prev ? { ...prev, durum: 'onaylandi' } : null)
      }
    } finally {
      setOnayLoading(false)
    }
  }

  const handlePdfIndir = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white font-bebas text-2xl animate-pulse">KASA AÇILIYOR...</div>
      </div>
    )
  }

  if (!teklif) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <div className="text-white font-bebas text-2xl">KASA BULUNAMADI</div>
          <button onClick={() => router.push('/kasa')} className="mt-4 text-gray-400 hover:text-white text-sm">
            ← Geri Dön
          </button>
        </div>
      </div>
    )
  }

  const araToplam = teklif.fiyat + (teklif.ekGiderler?.reduce((s, e) => s + e.tutar, 0) || 0)
  const indirimTutari = teklif.indirim || 0
  const kdvMatrahi = araToplam - indirimTutari
  const kdvTutari = kdvMatrahi * (teklif.kdvOrani / 100)
  const genelToplam = kdvMatrahi + kdvTutari

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button onClick={() => router.push('/kasa')} className="flex items-center gap-2 text-[#555] hover:text-[#1a1a1a] mb-6 font-montserrat text-sm transition-colors">
          <ArrowLeft size={16} /> Kasaya Geri Dön
        </button>

        {/* Header Card */}
        <div className="bg-[#1a1a1a] rounded-2xl p-8 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[#ffc107] font-mono text-xs mb-1">KASA #{teklif.teklifNo}</p>
              <h1 className="font-bebas text-3xl tracking-wider">{teklif.firmaAdi}</h1>
              <p className="text-gray-400 font-montserrat text-sm">{teklif.yetkiliKisi}</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono ${
                onaylandi || teklif.durum === 'onaylandi' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {onaylandi || teklif.durum === 'onaylandi' ? '✅ ONAYLANDI' : '⏳ BEKLIYOR'}
              </div>
              <p className="text-gray-400 font-mono text-xs mt-2">
                Geçerlilik: {formatDate(teklif.gecerlilikTarihi)}
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <p className="text-gray-400 font-montserrat text-sm"><strong className="text-white">Paket:</strong> {teklif.paketAdi} — {teklif.paketKategori}</p>
          </div>
        </div>

        {/* Is Listesi */}
        <div className="bg-white rounded-2xl border border-[#eaeaea] p-6 mb-6">
          <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a] mb-4">YAPILACAK İŞLER</h3>
          <ul className="space-y-3">
            {teklif.islerListesi?.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-montserrat text-[#555]">
                <div className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center ${item.tamamlandi ? 'bg-[#1a1a1a] border-[#1a1a1a]' : 'border-[#ccc]'}`}>
                  {item.tamamlandi && <span className="text-white text-xs">✓</span>}
                </div>
                {item.is}
              </li>
            ))}
          </ul>
        </div>

        {/* Fiyat Özeti */}
        <div className="bg-white rounded-2xl border border-[#eaeaea] p-6 mb-6">
          <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a] mb-4">FİYAT ÖZETİ</h3>
          <div className="space-y-3 text-sm font-montserrat">
            <div className="flex justify-between text-[#555]">
              <span>Paket Ücreti ({teklif.paketAdi})</span>
              <span>{teklif.fiyat.toLocaleString('tr-TR')} ₺</span>
            </div>
            {teklif.ekGiderler?.map((eg, i) => (
              <div key={i} className="flex justify-between text-[#555]">
                <span>{eg.aciklama}</span>
                <span>{eg.tutar.toLocaleString('tr-TR')} ₺</span>
              </div>
            ))}
            <div className="flex justify-between text-[#555] border-t border-[#eaeaea] pt-3">
              <span>Ara Toplam</span>
              <span>{araToplam.toLocaleString('tr-TR')} ₺</span>
            </div>
            {indirimTutari > 0 && (
              <div className="flex justify-between text-green-600">
                <span>İndirim</span>
                <span>-{indirimTutari.toLocaleString('tr-TR')} ₺</span>
              </div>
            )}
            <div className="flex justify-between text-[#555]">
              <span>KDV (%{teklif.kdvOrani})</span>
              <span>{kdvTutari.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between text-[#1a1a1a] font-bold text-xl border-t-2 border-[#1a1a1a] pt-3 mt-3">
              <span className="font-bebas tracking-wider">GENEL TOPLAM</span>
              <span className="font-bebas">{genelToplam.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {!onaylandi && teklif.durum !== 'onaylandi' ? (
            <button
              onClick={handleOnayla}
              disabled={onayLoading}
              className="col-span-1 sm:col-span-1 bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 py-4 font-montserrat font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              <CheckCircle size={18} />
              {onayLoading ? 'ONAYLANIYOR...' : 'TEKLİFİ ONAYLA'}
            </button>
          ) : (
            <div className="col-span-1 bg-green-100 text-green-700 rounded-xl px-6 py-4 font-montserrat font-bold text-sm flex items-center justify-center gap-2">
              <CheckCircle size={18} />
              ONAYLANDI
            </div>
          )}
          <a
            href={`https://wa.me/905446844067?text=Merhaba,%20${kasaNo}%20numaralı%20teklif%20hakkında%20görüşmek%20istiyorum.`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#1ea952] text-white rounded-xl px-6 py-4 font-montserrat font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle size={18} />
            WHATSAPP
          </a>
          <button
            onClick={handlePdfIndir}
            className="bg-[#1a1a1a] hover:bg-[#333] text-white rounded-xl px-6 py-4 font-montserrat font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={18} />
            PDF İNDİR
          </button>
        </div>
      </div>
    </div>
  )
}
