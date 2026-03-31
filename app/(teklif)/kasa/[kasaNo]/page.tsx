"use client"
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { CheckCircle, MessageCircle, Lock, Shield, Clock, ChevronRight, Phone, TrendingUp, Award, Zap, Star, ArrowRight, Sparkles, BarChart3, Target, Rocket, Users, Download } from 'lucide-react'

interface TeklifDetay {
  id: string; teklifNo: string; firmaAdi: string; yetkiliKisi: string
  paketAdi: string; paketKategori: string; paketDetay: string; stratejiNotu?: string
  islerListesi: { is: string; tamamlandi: boolean }[]
  ekGiderler: { aciklama: string; tutar: number }[]
  fiyat: number; indirim: number; kdvOrani: number; toplam: number
  durum: string; gecerlilikTarihi: string; createdAt: string
}

function AnimatedNumber({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return <span ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>{value}{suffix}</span>
}

export default function TeklifDetayPage() {
  const { kasaNo } = useParams()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { data: session, status } = useSession()
  const [teklif, setTeklif] = useState<TeklifDetay | null>(null)
  const [loading, setLoading] = useState(true)
  const [onayLoading, setOnayLoading] = useState(false)
  const [onaylandi, setOnaylandi] = useState(false)
  const [sifreModal, setSifreModal] = useState(false)
  const [sifre, setSifre] = useState('')
  const [sifreLoading, setSifreLoading] = useState(false)
  const [sifreHata, setSifreHata] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
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
      if (res.ok) {
        setOnaylandi(true)
        setShowConfetti(true)
        setTeklif(prev => prev ? { ...prev, durum: 'onaylandi' } : null)
        setTimeout(() => setShowConfetti(false), 4000)
      }
    } finally { setOnayLoading(false) }
  }

  if (sifreModal) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ffc107] to-[#ff9800] rounded-2xl mb-5 shadow-[0_0_40px_rgba(255,193,7,0.3)]">
              <Lock className="text-black" size={24} />
            </div>
            <p className="font-bebas text-3xl tracking-[5px] text-white mb-1">404 DİJİTAL</p>
            <p className="text-gray-500 text-sm font-montserrat">Kasa #{kasaNo}</p>
          </div>
          <form onSubmit={handleSifreGiris} className="space-y-4">
            <input
              type="password" value={sifre} onChange={e => setSifre(e.target.value)}
              placeholder="••••••••"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-[#ffc107]/50 focus:bg-white/8 text-center tracking-[8px] transition-all"
            />
            {sifreHata && <p className="text-red-400 text-xs text-center font-montserrat">{sifreHata}</p>}
            <button type="submit" disabled={sifreLoading || !sifre.trim()}
              className="w-full bg-gradient-to-r from-[#ffc107] to-[#ff9800] hover:from-[#ffca28] hover:to-[#ffa726] text-black font-bebas text-lg tracking-widest rounded-2xl py-4 transition-all disabled:opacity-40 shadow-[0_4px_20px_rgba(255,193,7,0.25)]">
              {sifreLoading ? 'GİRİŞ YAPILIYOR...' : 'KASAYI AÇ'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#ffc107] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-montserrat text-sm">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!teklif) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔒</p>
          <p className="text-white font-bebas text-2xl tracking-wider">KASA BULUNAMADI</p>
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
  const isAcil = gecerlilikGun <= 3 && gecerlilikGun > 0

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(255,193,7,0.4); } 50% { box-shadow: 0 0 40px rgba(255,193,7,0.7), 0 0 80px rgba(255,193,7,0.2); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes confetti-fall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.6s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.6s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.6s 0.3s ease both; }
        .fade-up-4 { animation: fadeUp 0.6s 0.4s ease both; }
        .fade-up-5 { animation: fadeUp 0.6s 0.5s ease both; }
        .fade-up-6 { animation: fadeUp 0.6s 0.6s ease both; }
        .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .float-anim { animation: float 3s ease-in-out infinite; }
        .shimmer-text { background: linear-gradient(90deg, #ffc107 0%, #fff7cc 40%, #ffc107 60%, #ff9800 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 3s linear infinite; }
        .gradient-border { position: relative; } .gradient-border::before { content: ''; position: absolute; inset: -1px; background: linear-gradient(135deg, #ffc107, #ff9800, #ffc107); border-radius: inherit; z-index: -1; opacity: 0.5; }
        .confetti-piece { position: fixed; width: 10px; height: 10px; animation: confetti-fall 3s ease-out forwards; z-index: 9999; }
        @media print { .no-print { display: none !important; } body { background: white !important; color: black !important; } @page { margin: 1.5cm; size: A4; } }
      `}</style>

      {/* CONFETTI */}
      {showConfetti && Array.from({ length: 60 }).map((_, i) => (
        <div key={i} className="confetti-piece no-print" style={{
          left: `${Math.random() * 100}%`,
          top: `-20px`,
          backgroundColor: ['#ffc107','#ff9800','#4CAF50','#2196F3','#E91E63','#9C27B0'][Math.floor(Math.random() * 6)],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 2}s`,
          width: `${6 + Math.random() * 10}px`,
          height: `${6 + Math.random() * 10}px`,
        }} />
      ))}

      {/* TOP BAR */}
      <div className="fixed top-0 left-0 right-0 z-50 no-print" style={{ background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#ffc107] to-[#ff9800] rounded-lg flex items-center justify-center shadow-[0_2px_10px_rgba(255,193,7,0.3)]">
              <span className="font-bebas text-black text-sm tracking-tight">404</span>
            </div>
            <span className="font-bebas tracking-[3px] text-sm text-white/80">404 DİJİTAL</span>
          </div>
          {!isOnaylandi && (
            isAcil ? (
              <div className="flex items-center gap-1.5 bg-red-500/15 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full text-xs font-montserrat font-semibold">
                <Clock size={11} className="animate-pulse" /> Son {gecerlilikGun} gün!
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-[#ffc107]/10 text-[#ffc107] px-3 py-1.5 rounded-full text-xs font-montserrat">
                <Clock size={11} /> {gecerlilikGun} gün geçerli
              </div>
            )
          )}
          {isOnaylandi && (
            <div className="flex items-center gap-1.5 bg-green-500/15 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full text-xs font-montserrat font-semibold">
              <CheckCircle size={11} /> Onaylandı
            </div>
          )}
        </div>
      </div>

      {/* ONAY EKRANI */}
      {isOnaylandi && (
        <div className="min-h-screen flex items-center justify-center px-4 pt-16">
          <div className="text-center max-w-lg">
            <div className="w-28 h-28 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-6 float-anim">
              <CheckCircle size={56} className="text-green-400" />
            </div>
            <h1 className="font-bebas text-5xl tracking-wider text-green-400 mb-3">ANLAŞMA TAMAM!</h1>
            <p className="text-gray-300 font-montserrat text-lg mb-2">Hoş geldin, <strong className="text-white">{teklif.yetkiliKisi}</strong>.</p>
            <p className="text-gray-400 font-montserrat text-sm leading-relaxed mb-8">
              Teklifinizi onayladınız. Ekibimiz en kısa sürede sizinle iletişime geçecek ve süreci başlatacak. Büyük bir adım attınız!
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { step: '1', text: 'Sizi arıyoruz', icon: Phone },
                { step: '2', text: 'Sözleşme imzalanır', icon: Shield },
                { step: '3', text: 'İşe başlıyoruz', icon: Rocket },
              ].map(({ step, text, icon: Icon }) => (
                <div key={step} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="w-8 h-8 bg-[#ffc107]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Icon size={14} className="text-[#ffc107]" />
                  </div>
                  <p className="text-xs text-gray-400 font-montserrat">{text}</p>
                </div>
              ))}
            </div>
            <a href={`https://wa.me/905446844067?text=Merhaba%20Furkan%20Bey%2C%20${kasaNo}%20numaral%C4%B1%20teklifi%20onaylad%C4%B1m.%20Ne%20zaman%20ba%C5%9Flayabiliriz%3F`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ea952] text-white rounded-2xl px-8 py-4 font-montserrat font-bold text-sm transition-all shadow-[0_4px_20px_rgba(37,211,102,0.3)]">
              <MessageCircle size={18} /> WhatsApp ile Devam Et
            </a>
            <div className="no-print mt-6">
              <button onClick={() => { document.title = `Teklif-${teklif.teklifNo}`; window.print(); setTimeout(() => { document.title = '404 Dijital' }, 1000) }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-400 font-montserrat text-xs transition-colors mx-auto">
                <Download size={13} /> Teklifi PDF olarak indir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANA SAYFA — ONAYLANMAMIŞSA */}
      {!isOnaylandi && (
        <div className="pt-16">

          {/* HERO */}
          <div className="relative overflow-hidden">
            {/* Arka plan efekti */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #ffc107 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-16 pb-10 text-center fade-up-1">
              <div className="inline-flex items-center gap-2 bg-[#ffc107]/10 border border-[#ffc107]/20 text-[#ffc107] text-xs font-montserrat font-semibold px-4 py-2 rounded-full mb-6">
                <Sparkles size={12} /> ÖZEL TEKLİF · {teklif.teklifNo}
              </div>
              <h1 className="font-bebas text-5xl md:text-7xl leading-none mb-4 tracking-wide">
                <span className="text-gray-400">Sayın</span><br />
                <span className="shimmer-text">{teklif.firmaAdi}</span>
              </h1>
              <p className="text-gray-400 font-montserrat text-base leading-relaxed max-w-lg mx-auto mb-8">
                Bu sayfa yalnızca sizin için hazırlandı. Dijital varlığınızı büyütmek için özel olarak tasarlanmış paketinizi aşağıda bulabilirsiniz.
              </p>

              {/* Ana fiyat */}
              <div className="inline-block bg-white/5 border border-white/10 rounded-3xl px-8 py-6 mb-4">
                <p className="text-gray-500 font-montserrat text-xs uppercase tracking-widest mb-2">Aylık Toplam Yatırım</p>
                <p className="font-bebas text-6xl md:text-7xl text-white tracking-tight">
                  {teklif.toplam.toLocaleString('tr-TR')}
                  <span className="text-3xl text-[#ffc107] ml-2">₺</span>
                </p>
                <p className="text-gray-500 font-montserrat text-xs mt-1">KDV dahil · {teklif.paketAdi}</p>
              </div>

              {/* Aciliyet */}
              {isAcil && (
                <div className="fade-up-2 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3 inline-flex items-center gap-2 mt-3">
                  <Clock size={14} className="text-red-400 animate-pulse" />
                  <span className="text-red-400 font-montserrat text-sm font-semibold">Bu teklif yalnızca {gecerlilikGun} gün daha geçerli!</span>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-2xl mx-auto px-4 space-y-4 pb-32">

            {/* SOSYAL KANIT */}
            <div className="fade-up-2 grid grid-cols-3 gap-3 no-print">
              {[
                { icon: TrendingUp, value: '850', suffix: '%+', label: 'Ortalama ROI' },
                { icon: Users, value: '50', suffix: '+', label: 'Mutlu Müşteri' },
                { icon: Award, value: '4', suffix: '+ Yıl', label: 'Sektör Deneyimi' },
              ].map(({ icon: Icon, value, suffix, label }) => (
                <div key={label} className="bg-white/3 border border-white/8 rounded-2xl p-4 text-center hover:border-[#ffc107]/30 hover:bg-white/5 transition-all">
                  <Icon size={18} className="text-[#ffc107] mx-auto mb-2" />
                  <p className="font-bebas text-2xl text-white"><AnimatedNumber value={value} suffix={suffix} /></p>
                  <p className="text-gray-500 text-xs font-montserrat mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* STRATEJİ NOTU — kişiselleştirilmiş bölüm */}
            {teklif.stratejiNotu && (
              <div className="fade-up-3 relative gradient-border rounded-2xl overflow-hidden">
                <div className="bg-[#111] rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #111 0%, #0f0e08 100%)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#ffc107] rounded-xl flex items-center justify-center">
                      <Target size={16} className="text-black" />
                    </div>
                    <div>
                      <p className="font-bebas tracking-wider text-white text-lg leading-none">KİŞİSEL ANALİZİNİZ</p>
                      <p className="text-gray-500 text-xs font-montserrat">Sadece size özel hazırlandı</p>
                    </div>
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-[#ffc107]/30 via-[#ffc107]/10 to-transparent mb-4" />
                  <p className="text-gray-300 font-montserrat text-sm leading-relaxed whitespace-pre-wrap italic">
                    "{teklif.stratejiNotu}"
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#ffc107] rounded-full flex items-center justify-center text-black font-bebas text-xs">F</div>
                    <p className="text-gray-500 font-montserrat text-xs">Furkan Akyol · 404 Dijital Kurucu</p>
                  </div>
                </div>
              </div>
            )}

            {/* HİZMETLER */}
            <div className="fade-up-3 bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 bg-[#ffc107]/15 rounded-xl flex items-center justify-center">
                  <Zap size={17} className="text-[#ffc107]" />
                </div>
                <div>
                  <p className="font-bebas tracking-wider text-white text-xl">PAKETE DAHİL HİZMETLER</p>
                  <p className="text-gray-500 text-xs font-montserrat">{teklif.islerListesi?.length || 0} farklı hizmet</p>
                </div>
              </div>
              <div className="p-5 grid gap-2">
                {teklif.islerListesi?.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/3 hover:bg-white/5 transition-all border border-white/5 group">
                    <div className="w-5 h-5 rounded-lg bg-[#ffc107] flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <CheckCircle size={12} className="text-black" strokeWidth={3} />
                    </div>
                    <span className="text-gray-200 font-montserrat text-sm leading-tight">{item.is}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PAKET DETAY */}
            {teklif.paketDetay && (
              <div className="fade-up-4 bg-white/3 border border-white/8 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={16} className="text-[#ffc107]" />
                  <p className="font-bebas tracking-wider text-white text-lg">PAKET AÇIKLAMASI</p>
                </div>
                <p className="text-gray-400 font-montserrat text-sm leading-relaxed whitespace-pre-wrap">{teklif.paketDetay}</p>
              </div>
            )}

            {/* FİYAT DETAYI */}
            <div className="fade-up-4 bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/5">
                <p className="font-bebas tracking-wider text-white text-xl">FİYATLANDIRMA</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center text-sm font-montserrat">
                  <span className="text-gray-400">{teklif.paketAdi}</span>
                  <span className="text-white font-semibold">{teklif.fiyat.toLocaleString('tr-TR')} ₺</span>
                </div>
                {teklif.ekGiderler?.map((eg, i) => (
                  <div key={i} className="flex justify-between items-center text-sm font-montserrat">
                    <span className="text-gray-400">{eg.aciklama}</span>
                    <span className="text-white font-semibold">{eg.tutar.toLocaleString('tr-TR')} ₺</span>
                  </div>
                ))}
                {indirimTutari > 0 && (
                  <div className="flex justify-between items-center text-sm font-montserrat bg-green-500/8 rounded-xl px-4 py-3 border border-green-500/15">
                    <span className="text-green-400 font-semibold">Özel İndirim</span>
                    <span className="text-green-400 font-bold">-{indirimTutari.toLocaleString('tr-TR')} ₺</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs font-montserrat text-gray-500 pt-2 border-t border-white/5">
                  <span>KDV (%{teklif.kdvOrani})</span>
                  <span className="text-gray-400">{kdvTutari.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between items-center rounded-2xl px-5 py-4 mt-1"
                  style={{ background: 'linear-gradient(135deg, #1a1600 0%, #0f0e00 100%)', border: '1px solid rgba(255,193,7,0.2)' }}>
                  <div>
                    <p className="font-bebas text-2xl tracking-wider text-white">TOPLAM</p>
                    <p className="text-gray-500 text-xs font-montserrat">KDV Dahil · Aylık</p>
                  </div>
                  <p className="font-bebas text-3xl text-[#ffc107]">{teklif.toplam.toLocaleString('tr-TR')} ₺</p>
                </div>
              </div>
            </div>

            {/* NEDEN 404 DİJİTAL */}
            <div className="fade-up-5 bg-white/3 border border-white/8 rounded-2xl p-6 no-print">
              <p className="font-bebas text-xl tracking-wider text-white mb-4">NEDEN 404 DİJİTAL?</p>
              <div className="space-y-3">
                {[
                  { icon: Star, text: 'Sonuç odaklı çalışıyoruz — ödemeni hak etmeden almıyoruz.' },
                  { icon: Shield, text: 'İlk ay sonuç almazsan, bir ay ücretsiz devam ederiz.' },
                  { icon: Rocket, text: 'Strateji, içerik, reklam ve analiz — tek çatı altında.' },
                  { icon: TrendingUp, text: 'Reklam yatırımından ortalama %850 ROI sağlıyoruz.' },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#ffc107]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={13} className="text-[#ffc107]" />
                    </div>
                    <p className="text-gray-300 font-montserrat text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SÜREÇ */}
            <div className="fade-up-5 no-print">
              <p className="font-bebas text-xl tracking-wider text-white mb-4 text-center">ONAYLARSAN NE OLUR?</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { n: '01', icon: Phone, title: 'Seni Arıyoruz', desc: 'Aynı gün içinde seni arıyoruz.' },
                  { n: '02', icon: Shield, title: 'Sözleşme', desc: 'Kısa, net sözleşme imzalanır.' },
                  { n: '03', icon: Rocket, title: 'Başlıyoruz', desc: 'İlk hafta çalışmalar başlar.' },
                ].map(({ n, icon: Icon, title, desc }) => (
                  <div key={n} className="bg-white/3 border border-white/8 rounded-2xl p-4 text-center relative overflow-hidden">
                    <div className="absolute top-3 right-3 font-bebas text-4xl text-white/3 leading-none">{n}</div>
                    <div className="w-10 h-10 bg-[#ffc107]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon size={18} className="text-[#ffc107]" />
                    </div>
                    <p className="font-montserrat font-bold text-white text-xs mb-1">{title}</p>
                    <p className="text-gray-500 text-xs font-montserrat leading-tight">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PDF BUTONU */}
            <div className="no-print flex justify-center pb-2">
              <button onClick={() => { document.title = `Teklif-${teklif.teklifNo}`; window.print(); setTimeout(() => { document.title = '404 Dijital' }, 1000) }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-400 font-montserrat text-xs transition-colors">
                <Download size={13} /> Teklifi PDF olarak indir
              </button>
            </div>

          </div>

          {/* STICKY CTA — altta sabit */}
          <div ref={ctaRef} className="no-print fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="max-w-2xl mx-auto px-4 py-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-gray-400 font-montserrat text-xs">Ekibimiz hazır</span>
                </div>
                <div className="h-3 w-px bg-white/10" />
                <span className="text-gray-500 font-montserrat text-xs">
                  {gecerlilikGun > 0 ? `${gecerlilikGun} gün geçerli` : 'Bugün son gün!'}
                </span>
              </div>
              <button
                onClick={handleOnayla}
                disabled={onayLoading}
                className="w-full font-bebas text-xl tracking-widest rounded-2xl py-4 transition-all disabled:opacity-60 flex items-center justify-center gap-3 pulse-glow"
                style={{ background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)', color: '#000' }}
              >
                {onayLoading ? (
                  <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> ONAYLANIYOR...</>
                ) : (
                  <><CheckCircle size={20} /> TEKLİFİ ONAYLA — İŞE BAŞLAYALIM <ArrowRight size={18} /></>
                )}
              </button>
              <div className="flex gap-3 mt-3">
                <a href={`https://wa.me/905446844067?text=Merhaba%2C%20${kasaNo}%20numaral%C4%B1%20teklif%20hakk%C4%B1nda%20soru%20sormak%20istiyorum.`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/25 text-[#25D366] rounded-xl py-3 font-montserrat font-semibold text-xs flex items-center justify-center gap-2 transition-all">
                  <MessageCircle size={14} /> Soru Sor
                </a>
                <a href="tel:+905446844067"
                  className="flex-1 bg-white/5 hover:bg-white/8 border border-white/10 text-gray-300 rounded-xl py-3 font-montserrat font-semibold text-xs flex items-center justify-center gap-2 transition-all">
                  <Phone size={14} /> Ara
                </a>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
