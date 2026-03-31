"use client"
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { CheckCircle, MessageCircle, Download, Lock, Shield, Clock, Star, ChevronRight, Phone, TrendingUp, Award, Zap } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface TeklifDetay {
  id: string; teklifNo: string; firmaAdi: string; yetkiliKisi: string
  paketAdi: string; paketKategori: string; paketDetay: string; stratejiNotu?: string
  islerListesi: { is: string; tamamlandi: boolean }[]
  ekGiderler: { aciklama: string; tutar: number }[]
  fiyat: number; indirim: number; kdvOrani: number; toplam: number
  durum: string; gecerlilikTarihi: string; createdAt: string
}

export default function TeklifDetayPage() {
  const { kasaNo } = useParams()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { data: session, status } = useSession()
  const router = useRouter()
  const [teklif, setTeklif] = useState<TeklifDetay | null>(null)
  const [loading, setLoading] = useState(true)
  const [onayLoading, setOnayLoading] = useState(false)
  const [onaylandi, setOnaylandi] = useState(false)
  const [sifreModal, setSifreModal] = useState(false)
  const [sifre, setSifre] = useState('')
  const [sifreLoading, setSifreLoading] = useState(false)
  const [sifreHata, setSifreHata] = useState('')
  const ctaRef = useRef<HTMLDivElement>(null)

  const userType = (session?.user as any)?.type
  const userKasaNo = (session?.user as any)?.kasaNo

  useEffect(() => {
    if (token) { fetchTeklif(); return }
    if (status === 'loading') return
    const authorized = session && (userType === 'admin' || userKasaNo === kasaNo)
    if (!authorized) { setSifreModal(true); setLoading(false) }
    else fetchTeklif()
  }, [status, session, kasaNo, token])

  const fetchTeklif = async () => {
    setLoading(true)
    try {
      const url = token ? `/api/teklif/${kasaNo}?token=${token}` : `/api/teklif/${kasaNo}`
      const res = await fetch(url)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTeklif(data)
      if (data.durum === 'onaylandi') setOnaylandi(true)
    } catch { setTeklif(null) }
    finally { setLoading(false) }
  }

  const handleSifreGiris = async (e: React.FormEvent) => {
    e.preventDefault()
    setSifreLoading(true); setSifreHata('')
    const result = await signIn('credentials', { email: kasaNo as string, password: sifre, type: 'musteri', redirect: false })
    if (result?.ok) { setSifreModal(false); fetchTeklif() }
    else setSifreHata('Şifre hatalı.')
    setSifreLoading(false)
  }

  const handleOnayla = async () => {
    if (!teklif) return
    setOnayLoading(true)
    try {
      const res = await fetch('/api/teklif/onayla', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kasaNo }),
      })
      if (res.ok) { setOnaylandi(true); setTeklif(prev => prev ? { ...prev, durum: 'onaylandi' } : null) }
    } finally { setOnayLoading(false) }
  }

  if (sifreModal) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#ffc107]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="text-[#ffc107]" size={28} />
            </div>
            <h1 className="font-bebas text-3xl tracking-[4px] text-white mb-1">404 DİJİTAL</h1>
            <p className="text-gray-400 text-sm font-montserrat">Kasa #{kasaNo}</p>
          </div>
          <form onSubmit={handleSifreGiris} className="space-y-4">
            <input
              type="password" value={sifre} onChange={e => setSifre(e.target.value)}
              placeholder="Şifrenizi girin"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-[#ffc107]/50 text-center tracking-[6px]"
            />
            {sifreHata && <p className="text-red-400 text-xs text-center">{sifreHata}</p>}
            <button type="submit" disabled={sifreLoading || !sifre.trim()}
              className="w-full bg-[#ffc107] hover:bg-[#e6b000] text-black font-bebas text-lg tracking-wider rounded-xl py-4 transition-colors disabled:opacity-40">
              {sifreLoading ? 'GİRİŞ YAPILIYOR...' : 'KASAYI AÇ'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#ffc107] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-montserrat text-sm">Teklif yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!teklif) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <div className="text-white font-bebas text-2xl">KASA BULUNAMADI</div>
        </div>
      </div>
    )
  }

  const araToplam = teklif.fiyat + (teklif.ekGiderler?.reduce((s, e) => s + e.tutar, 0) || 0)
  const indirimTutari = teklif.indirim || 0
  const kdvMatrahi = araToplam - indirimTutari
  const kdvTutari = kdvMatrahi * (teklif.kdvOrani / 100)
  const isOnaylandi = onaylandi || teklif.durum === 'onaylandi'

  const gecerlilikGun = Math.max(0, Math.ceil((new Date(teklif.gecerlilikTarihi).getTime() - Date.now()) / 86400000))

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 1.5cm; size: A4; }
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.5s ease forwards; }
      `}</style>

      {/* HEADER */}
      <div className="bg-[#0f0f0f] no-print">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#ffc107] rounded-lg flex items-center justify-center">
              <span className="font-bebas text-black text-lg tracking-tight">404</span>
            </div>
            <div>
              <p className="text-white font-bebas tracking-wider text-lg leading-none">404 DİJİTAL</p>
              <p className="text-gray-500 text-xs font-montserrat">Teklif Portalı</p>
            </div>
          </div>
          {!isOnaylandi && gecerlilikGun <= 3 && gecerlilikGun > 0 && (
            <div className="flex items-center gap-2 bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-full text-xs font-montserrat font-semibold">
              <Clock size={13} />
              Son {gecerlilikGun} gün
            </div>
          )}
          {isOnaylandi && (
            <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full text-xs font-montserrat font-semibold">
              <CheckCircle size={13} />
              Onaylandı
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* HERO — Firma & Tutar */}
        <div className="slide-up bg-[#0f0f0f] rounded-2xl overflow-hidden">
          <div className="p-8">
            <p className="text-[#ffc107] font-mono text-xs tracking-widest mb-3">ÖZEL TEKLİF · #{teklif.teklifNo}</p>
            <h1 className="font-bebas text-4xl md:text-5xl text-white tracking-wider leading-none mb-1">
              {teklif.firmaAdi}
            </h1>
            <p className="text-gray-400 font-montserrat text-sm mb-8">{teklif.yetkiliKisi}</p>

            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
              <div>
                <p className="text-gray-500 font-montserrat text-xs uppercase tracking-wider mb-1">Toplam Yatırım</p>
                <p className="font-bebas text-5xl text-white tracking-tight">
                  {teklif.toplam.toLocaleString('tr-TR')} <span className="text-2xl text-gray-400">₺</span>
                </p>
                <p className="text-gray-500 font-montserrat text-xs mt-1">KDV Dahil / Aylık</p>
              </div>
              <div className="sm:ml-auto">
                <div className="bg-white/5 rounded-xl px-4 py-3 text-center">
                  <p className="text-white font-bebas text-xl tracking-wider">{teklif.paketAdi}</p>
                  <p className="text-gray-400 text-xs font-montserrat">{teklif.paketKategori}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar geçerlilik */}
          {!isOnaylandi && (
            <div className="px-8 pb-6">
              <div className="flex justify-between text-xs font-montserrat text-gray-500 mb-2">
                <span>Teklif geçerlilik süresi</span>
                <span className={gecerlilikGun <= 3 ? 'text-orange-400' : 'text-gray-400'}>
                  {gecerlilikGun > 0 ? `${gecerlilikGun} gün kaldı` : 'Süresi doldu'}
                </span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${gecerlilikGun <= 3 ? 'bg-orange-500' : 'bg-[#ffc107]'}`}
                  style={{ width: `${Math.min(100, (gecerlilikGun / 30) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* NEDEN 404 DİJİTAL — güven sinyali */}
        <div className="slide-up grid grid-cols-3 gap-3 no-print">
          {[
            { icon: TrendingUp, val: '%850+', label: 'Ortalama ROI' },
            { icon: Star, val: '50+', label: 'Mutlu Müşteri' },
            { icon: Award, val: '4+ Yıl', label: 'Deneyim' },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="bg-white rounded-xl p-4 text-center border border-[#eaeaea]">
              <Icon size={20} className="mx-auto mb-2 text-[#1a1a1a]" />
              <p className="font-bebas text-xl tracking-wider text-[#1a1a1a]">{val}</p>
              <p className="text-[#888] text-xs font-montserrat">{label}</p>
            </div>
          ))}
        </div>

        {/* HİZMETLER */}
        <div className="slide-up bg-white rounded-2xl border border-[#eaeaea] overflow-hidden">
          <div className="p-6 border-b border-[#eaeaea]">
            <h2 className="font-bebas text-2xl tracking-wider text-[#1a1a1a] flex items-center gap-2">
              <Zap size={20} className="text-[#ffc107]" />
              YAPILACAK HİZMETLER
            </h2>
          </div>
          <div className="p-6">
            <div className="grid gap-3">
              {teklif.islerListesi?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#f0f0f0]">
                  <div className="w-6 h-6 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={14} className="text-[#ffc107]" />
                  </div>
                  <span className="text-sm font-montserrat text-[#333] font-medium">{item.is}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FİYAT DETAY */}
        <div className="slide-up bg-white rounded-2xl border border-[#eaeaea] overflow-hidden">
          <div className="p-6 border-b border-[#eaeaea]">
            <h2 className="font-bebas text-2xl tracking-wider text-[#1a1a1a]">FİYATLANDIRMA</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between items-center text-sm font-montserrat">
              <span className="text-[#888]">{teklif.paketAdi}</span>
              <span className="font-semibold text-[#1a1a1a]">{teklif.fiyat.toLocaleString('tr-TR')} ₺</span>
            </div>
            {teklif.ekGiderler?.map((eg, i) => (
              <div key={i} className="flex justify-between items-center text-sm font-montserrat">
                <span className="text-[#888]">{eg.aciklama}</span>
                <span className="font-semibold text-[#1a1a1a]">{eg.tutar.toLocaleString('tr-TR')} ₺</span>
              </div>
            ))}
            {indirimTutari > 0 && (
              <div className="flex justify-between items-center text-sm font-montserrat bg-green-50 rounded-lg px-3 py-2 border border-green-100">
                <span className="text-green-700 font-semibold">İndirim</span>
                <span className="text-green-700 font-bold">-{indirimTutari.toLocaleString('tr-TR')} ₺</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-montserrat text-[#888] border-t border-[#f0f0f0] pt-3">
              <span>KDV (%{teklif.kdvOrani})</span>
              <span>{kdvTutari.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between items-center bg-[#0f0f0f] rounded-xl px-5 py-4 mt-2">
              <span className="font-bebas text-xl tracking-wider text-white">TOPLAM</span>
              <span className="font-bebas text-2xl text-[#ffc107]">{teklif.toplam.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>
        </div>

        {/* STRATEJİ NOTU */}
        {teklif.stratejiNotu && (
          <div className="slide-up bg-white rounded-2xl border border-[#eaeaea] overflow-hidden">
            <div className="p-6 border-b border-[#eaeaea]">
              <h2 className="font-bebas text-2xl tracking-wider text-[#1a1a1a]">KİŞİSEL STRATEJİ NOTUNUZ</h2>
            </div>
            <div className="p-6">
              <p className="text-sm font-montserrat text-[#555] leading-relaxed whitespace-pre-wrap">{teklif.stratejiNotu}</p>
            </div>
          </div>
        )}

        {/* GÜVENCE */}
        <div className="slide-up bg-[#ffc107]/5 border border-[#ffc107]/20 rounded-2xl p-5 no-print">
          <div className="flex items-start gap-4">
            <Shield size={24} className="text-[#ffc107] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-montserrat font-bold text-sm text-[#1a1a1a] mb-1">404 Dijital Güvencesi</p>
              <p className="text-xs font-montserrat text-[#666] leading-relaxed">
                İlk ay sonuç almazsan, bir ay ücretsiz devam ederiz. Markanın büyümesi bizim sorumluluğumuz.
              </p>
            </div>
          </div>
        </div>

        {/* CTA BÖLÜMÜ */}
        <div ref={ctaRef} className="slide-up no-print pb-4">
          {!isOnaylandi ? (
            <div className="bg-[#0f0f0f] rounded-2xl p-6 space-y-4">
              <div className="text-center mb-2">
                <p className="text-white font-bebas text-2xl tracking-wider">BU TEKLİFİ ONAYLA</p>
                <p className="text-gray-400 text-xs font-montserrat mt-1">Onayladıktan sonra ekibimiz sizi arayacak</p>
              </div>
              <button onClick={handleOnayla} disabled={onayLoading}
                className="w-full bg-[#ffc107] hover:bg-[#e6b000] active:scale-[0.98] text-black font-bebas text-xl tracking-widest rounded-xl py-5 transition-all disabled:opacity-60 flex items-center justify-center gap-3">
                {onayLoading ? (
                  <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> ONAYLANIYOR...</>
                ) : (
                  <><CheckCircle size={22} /> TEKLİFİ ONAYLA <ChevronRight size={18} /></>
                )}
              </button>
              <div className="flex gap-3">
                <a href={`https://wa.me/905446844067?text=Merhaba, ${kasaNo} numaralı teklif hakkında konuşmak istiyorum.`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-xl py-3.5 font-montserrat font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                  <MessageCircle size={16} /> WhatsApp
                </a>
                <a href="tel:+905446844067"
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl py-3.5 font-montserrat font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                  <Phone size={16} /> Ara
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-white" />
              </div>
              <p className="font-bebas text-3xl text-green-400 tracking-wider mb-2">TEKLİF ONAYLANDI!</p>
              <p className="text-gray-400 font-montserrat text-sm mb-6">Ekibimiz en kısa sürede sizinle iletişime geçecek.</p>
              <a href={`https://wa.me/905446844067?text=Merhaba, ${kasaNo} numaralı teklifi onayladım.`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ea952] text-white rounded-xl px-6 py-3 font-montserrat font-bold text-sm transition-colors">
                <MessageCircle size={16} /> WhatsApp ile Devam Et
              </a>
            </div>
          )}
        </div>

        {/* PDF BUTONU */}
        <div className="no-print flex justify-center pb-4">
          <button onClick={() => { document.title = `Teklif-${teklif.teklifNo}`; window.print(); setTimeout(() => { document.title = '404 Dijital' }, 1000) }}
            className="flex items-center gap-2 text-[#888] hover:text-[#1a1a1a] font-montserrat text-sm transition-colors">
            <Download size={15} /> PDF olarak indir
          </button>
        </div>

      </div>
    </div>
  )
}
