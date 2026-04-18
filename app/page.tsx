"use client"
import { useState, useEffect, useRef } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WhatsAppFloat } from '@/components/layout/whatsapp-float'
import { HorizonHero } from '@/components/ui/horizon-hero'
import { TransitionLayer } from '@/components/ui/transition-layer'
import { SpinningLogos } from '@/components/ui/spinning-logos'
import { PricingCard } from '@/components/ui/pricing-card'
import { Send, Phone, MapPin, Mail, ArrowRight, TrendingUp, Users, BarChart3, Award } from 'lucide-react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unused = { TrendingUp, Users, BarChart3, Award }

// Pricing data
const CIRO_PAKETLER = [
  {
    name: 'Giriş Paketi',
    monthlyPrice: 35000,
    yearlyPrice: 28000,
    features: ['6 Reels Videosu', '12 Grafik Tasarım', 'Reklam Hesabı Kontrolü', 'Özel Satış Stratejisi', 'Aylık Performans Raporu'],
  },
  {
    name: 'Gold Paket',
    monthlyPrice: 50000,
    yearlyPrice: 40000,
    features: ['8 Reels Videosu', '16 Grafik Tasarım', 'Gelişmiş Reklam Yönetimi', '6-12 Aylık Yol Haritası', 'Rakip Analizi', 'A/B Test Optimizasyonu'],
    isPopular: true,
  },
  {
    name: 'Platinum Paket',
    monthlyPrice: 75000,
    yearlyPrice: 60000,
    features: ['12 Reels Videosu', '24 Grafik Tasarım', 'Tam Reklam Yönetimi', 'Influencer Koordinasyonu', 'Öncelikli Destek Hattı'],
  },
]

const SOSYAL_PAKETLER = [
  {
    name: 'Giriş',
    monthlyPrice: 30000,
    yearlyPrice: 24000,
    features: ['4 Reels / Kısa Video', '12 Feed Görseli', 'Instagram & Facebook Yönetimi', 'Etiket & Hashtag Stratejisi', 'Aylık İçerik Takvimi'],
  },
  {
    name: 'Gold',
    monthlyPrice: 45000,
    yearlyPrice: 36000,
    features: ['8 Reels / Kısa Video', '20 Feed Görseli', 'TikTok + Instagram + Facebook', 'Topluluk Yönetimi', 'Rakip İzleme Raporu', 'Story & Highlights Tasarımı'],
    isPopular: true,
  },
  {
    name: 'Platinum',
    monthlyPrice: 65000,
    yearlyPrice: 52000,
    features: ['14 Reels + 2 Uzun Form Video', '30 Feed Görseli', '5 Platform (IG, TT, FB, LinkedIn, X)', '7/24 Topluluk Yönetimi', 'Aylık Büyüme Strateji Sunumu', 'Influencer İşbirlikleri'],
  },
]

const UC_ALTMIS_PAKETLER = [
  {
    name: '360 Gold',
    monthlyPrice: 50000,
    yearlyPrice: 40000,
    features: ['Sosyal Medya Yönetimi', 'Google & Meta Reklam Yönetimi', 'E-posta Pazarlama Otomasyonu', 'SEO Temel Optimizasyon', 'Marka Tutarlılığı Denetimi'],
  },
  {
    name: '360 Pro',
    monthlyPrice: 75000,
    yearlyPrice: 60000,
    features: ['Gold özellikleri +', 'Satış Hunisi Tasarımı & Yönetimi', 'CRM Entegrasyonu & Lead Takibi', 'SMS & WhatsApp Kampanyaları', 'Conversion Rate Optimizasyonu', 'Haftalık Performans Toplantısı'],
    isPopular: true,
    badge: 'EN KAPSAMLI',
  },
  {
    name: '360 Platinum',
    monthlyPrice: 110000,
    yearlyPrice: 88000,
    features: ['Pro özellikleri +', 'Özel Marka Stratejisti Ataması', 'PR & Medya İlişkileri', 'Lansmanlar & Etkinlik Pazarlaması', 'Yıllık Büyüme Planı & CFO Raporu', 'Öncelikli Yönetici Destek Hattı'],
  },
]

const AD_HIKAYELERI = [
  {
    title: 'Volkswagen Think Small (1959)',
    img: '🚗',
    content: "1950'lerin Amerika'sında her marka devasa boyutlarda araçlar üretirken Volkswagen Beetle'ın küçüklüğü 'Think Small' sloganıyla avantaja çevrildi. Dönemin en büyük reklamcılık zihinlerinden Bill Bernbach, tüketiciyle dürüst ve doğrudan bir dil kurdu. Ürünün en 'zayıf' noktası en güçlü mesaja dönüştürüldü.",
    vision: '"Markanızın zayıf gibi görünen yönlerini doğru bir stratejiyle en güçlü satış silahına dönüştürebiliriz. Dürüstlük, her zaman en çok dönüşüm getiren kancadır."',
  },
  {
    title: 'Apple 1984',
    img: '🍎',
    content: "Super Bowl'da yayınlanan bu efsanevi reklamda Apple, bir bilgisayar tanıtmadı. Özgürlük için savaşan bir savaşçı anlattı. Ürün özellikleri değil, özgürleştirici ve devrimci bir fikir satıldı. Ridley Scott'ın yönettiği bu film, tek bir yayınla Apple'ı kültürel bir fenomene dönüştürdü.",
    vision: '"Tüketiciler mantıklarıyla değil, duygularıyla satın alırlar. Sadece ürününüzü değil, o ürünün arkasındaki fikri satmalısınız."',
  },
  {
    title: 'Red Bull Stratos (2012)',
    img: '🚀',
    content: "Felix Baumgartner'ın uzaydan 39 km yükseklikten yaptığı tarihi atlayış, 8 milyondan fazla kişi tarafından canlı izlendi. Red Bull, bu etkinlikle sadece bir enerji içeceği satmadı; insan sınırlarını zorlayan bir felsefe yarattı. 'Kanatlandırır' vaadi dünya sahnesinde somutlaştı.",
    vision: '"Bugünün dijital dünyasında dikkat çekmek için geleneksel sınırları aşmak zorundasınuz. Markanız için sıradan gönderiler paylaşmak yerine, viral olacak o büyük atlayışı kurguluyoruz."',
  },
]

const STATS = [
  { icon: TrendingUp, value: '%850+', label: 'Ortalama ROI' },
  { icon: Users, value: '50+', label: 'Aktif Müşteri' },
  { icon: BarChart3, value: '₺12M+', label: 'Yönetilen Reklam Bütçesi' },
  { icon: Award, value: '4+', label: 'Yıl Deneyim' },
]

export default function HomePage() {
  const [isYearly, setIsYearly] = useState(false)
  const [activePackageTab, setActivePackageTab] = useState('ciro')
  const [contactForm, setContactForm] = useState({ isim: '', email: '', telefon: '', mesaj: '' })
  const [contactSubmitted, setContactSubmitted] = useState(false)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactSubmitted(true)
    const w3payload = { access_key: '3c20d34e-3dfe-4ba8-a445-2265ac77ddcb', subject: `Iletisim Formu - ${contactForm.isim}`, from_name: '404 Dijital Form', message: `Isim: ${contactForm.isim}\nEposta: ${contactForm.email}\nTelefon: ${contactForm.telefon}\nMesaj: ${contactForm.mesaj}`, email: contactForm.email || 'form@404dijital.com' }
    await Promise.all([
      fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(w3payload) }).catch(() => {}),
      fetch('/api/iletisim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'iletisim', ...contactForm }) }).catch(() => {}),
    ])
  }

  return (
    <>
      <TransitionLayer />
      <Header />
      <WhatsAppFloat />

      {/* HERO */}
      <HorizonHero />

      {/* SPINNING LOGOS */}
      <div className="bg-white border-y border-[#eaeaea] py-4 overflow-hidden">
        <SpinningLogos />
      </div>

      {/* ABOUT */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">BİZ KİMİZ?</p>
              <h2 className="font-bebas text-5xl text-[#1a1a1a] tracking-wider mb-6 leading-tight">
                NEDEN 404 DİJİTAL?
              </h2>
              <p className="text-[#555] font-montserrat text-base leading-relaxed mb-6">
                Google ilk kurulduğunda 404 numaralı uçuş radardan kayboldu ve bir daha haber alınamadı. Google, bulunamayan sayfalara bu yüzden <strong>"404 Not Found"</strong> dedi.
              </p>
              <p className="text-[#555] font-montserrat text-base leading-relaxed mb-6">
                Biz piyasaya baktık ve <strong>"Gerçek bir reklam ajansı"</strong> bulamadık. Sadece post paylaşanlar vardı. Bu yüzden sektöre öncülük edecek, strateji ve satış odaklı 404 Dijital'i kurduk.
              </p>
              <div className="bg-[#1a1a1a] rounded-2xl p-6">
                <p className="text-[#ffc107] font-bebas text-xl tracking-wider mb-2">404 MANİFESTO</p>
                <p className="text-white font-montserrat text-sm leading-relaxed italic">
                  "Unutmayın; reklamcılık sanat değil, satış işidir."
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {AD_HIKAYELERI.map((hikaye, i) => (
                <div key={i} className="bg-[#f8f9fa] rounded-2xl p-6 border border-[#eaeaea] hover:border-[#1a1a1a] transition-colors cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">{hikaye.img}</div>
                    <div>
                      <h4 className="font-bebas text-lg tracking-wider text-[#1a1a1a] mb-2">{hikaye.title}</h4>
                      <p className="text-[#555] text-sm font-montserrat leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                        {hikaye.content}
                      </p>
                      <p className="text-[#1a1a1a] text-sm font-montserrat font-semibold mt-2 italic opacity-0 group-hover:opacity-100 transition-opacity">
                        {hikaye.vision}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="py-24 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">NASIL ÇALIŞIYORUZ?</p>
            <h2 className="font-bebas text-5xl text-[#1a1a1a] tracking-wider">ÇALIŞMA SÜRECİMİZ</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'ANALİZ', desc: 'İşletmenizi, hedef kitlenizi ve rakiplerinizi derinlemesine analiz ediyoruz.' },
              { step: '02', title: 'STRATEJİ', desc: 'Veriye dayalı, özelleştirilmiş büyüme stratejisi oluşturuyoruz.' },
              { step: '03', title: 'UYGULAMA', desc: 'Stratejiyi hayata geçiriyor, kampanyaları optimize ediyoruz.' },
              { step: '04', title: 'RAPORLAMA', desc: 'Aylık detaylı raporlarla şeffaf sonuçları paylaşıyoruz.' },
            ].map(({ step, title, desc }, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-[#eaeaea] hover:shadow-lg transition-shadow text-center">
                <div className="font-bebas text-5xl text-[#eaeaea] mb-3">{step}</div>
                <h3 className="font-bebas text-2xl text-[#1a1a1a] tracking-wider mb-3">{title}</h3>
                <p className="text-[#555] text-sm font-montserrat leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">PAKETLERİMİZ</p>
            <h2 className="font-bebas text-5xl text-[#1a1a1a] tracking-wider mb-8">FİYATLANDIRMA</h2>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-[#f8f9fa] rounded-full p-1 mb-8">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-full text-sm font-montserrat font-semibold transition-all ${!isYearly ? 'bg-[#1a1a1a] text-white shadow' : 'text-[#555]'}`}
              >
                AYLIK
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-full text-sm font-montserrat font-semibold transition-all flex items-center gap-2 ${isYearly ? 'bg-[#1a1a1a] text-white shadow' : 'text-[#555]'}`}
              >
                YILLIK
                <span className="bg-[#ffc107] text-black text-xs px-2 py-0.5 rounded-full font-bold">%20 İNDİRİM</span>
              </button>
            </div>

            {/* Package Category Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {[
                { id: 'ciro', label: 'CİRO ARTIRMA' },
                { id: 'sosyal', label: 'SOSYAL MEDYA' },
                { id: '360', label: '360 PAZARLAMA' },
                { id: 'eticaret', label: 'E-TİCARET' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivePackageTab(tab.id)}
                  className={`px-5 py-2 rounded-full text-xs font-montserrat font-bold tracking-wider transition-all border-2 ${activePackageTab === tab.id ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-[#eaeaea] text-[#555] hover:border-[#1a1a1a]'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Package Cards */}
          {activePackageTab === 'ciro' && (
            <div className="grid md:grid-cols-3 gap-8">
              {CIRO_PAKETLER.map((pkg, i) => (
                <PricingCard key={i} {...pkg} isYearly={isYearly} />
              ))}
            </div>
          )}
          {activePackageTab === 'sosyal' && (
            <div className="grid md:grid-cols-3 gap-8">
              {SOSYAL_PAKETLER.map((pkg, i) => (
                <PricingCard key={i} {...pkg} isYearly={isYearly} />
              ))}
            </div>
          )}
          {activePackageTab === '360' && (
            <div className="grid md:grid-cols-3 gap-8">
              {UC_ALTMIS_PAKETLER.map((pkg, i) => (
                <PricingCard key={i} {...pkg} isYearly={isYearly} />
              ))}
            </div>
          )}
          {activePackageTab === 'eticaret' && (
            <div className="max-w-lg mx-auto">
              <div className="pricing-card bg-white rounded-2xl border-2 border-[#1a1a1a] p-10 text-center">
                <h3 className="font-bebas text-3xl tracking-wider text-[#1a1a1a] mb-4">E-TİCARET PAKETİ</h3>
                <div className="font-bebas text-5xl text-[#1a1a1a] mb-1">20.000₺</div>
                <div className="text-[#555] text-sm font-montserrat mb-2">sabit ücret</div>
                <div className="inline-flex items-center gap-1 bg-[#ffc107] text-black text-sm font-bold px-4 py-1.5 rounded-full mb-6">
                  +%7 komisyon
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  {['Ürün Odaklı Performans Reklamları', 'Satış Başına Prim Modeli', 'ROAS Garantili Strateji', 'Dinamik Ürün Reklamları'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#555] font-montserrat">
                      <span className="text-green-500">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})} className="btn-primary w-full">
                  HEMEN BAŞLA
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* VANTAGE LAB */}
      <section id="vantage" className="py-24 bg-[#1a1a1a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#ffc107] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">YENİLİK MERKEZİ</p>
          <h2 className="font-bebas text-6xl tracking-wider mb-6">VANTAGE LAB</h2>
          <p className="text-gray-300 font-montserrat text-lg max-w-3xl mx-auto mb-10 leading-relaxed">
            Yapay zeka destekli içerik üretimi, veri analitiği ve otomasyon çözümleriyle markanızı geleceğe taşıyoruz.
            VANTAGE LAB'da her kampanya, teknoloji ve yaratıcılığın buluşma noktasında doğar.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: '🤖', title: 'AI İçerik Üretimi', desc: 'Yapay zeka ile ölçeklenebilir, kişiselleştirilmiş içerik stratejileri.' },
              { icon: '📊', title: 'Veri Analitiği', desc: 'Real-time dashboard ile kampanya performansını anlık izleyin.' },
              { icon: '⚡', title: 'Otomasyon', desc: 'Tekrar eden süreçleri otomatize edin, insan enerjisini stratejiye yönlendirin.' },
            ].map(({ icon, title, desc }, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-[#ffc107]/50 transition-colors">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-bebas text-xl tracking-wider mb-2 text-[#ffc107]">{title}</h3>
                <p className="text-gray-400 text-sm font-montserrat leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})}
            className="btn-primary"
            style={{ background: '#ffc107', color: '#1a1a1a' }}
          >
            VANTAGE LAB HAKKINDA BİLGİ AL
          </button>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">İLETİŞİM</p>
            <h2 className="font-bebas text-5xl text-[#1a1a1a] tracking-wider">BİZİMLE İLETİŞİME GEÇİN</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-2xl p-8 border border-[#eaeaea] shadow-sm">
              <h3 className="font-bebas text-2xl tracking-wider text-[#1a1a1a] mb-6">MESAJ GÖNDERIN</h3>
              {!contactSubmitted ? (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">İsim</label>
                      <input
                        type="text"
                        value={contactForm.isim}
                        onChange={e => setContactForm(p => ({...p, isim: e.target.value}))}
                        className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Telefon</label>
                      <input
                        type="tel"
                        value={contactForm.telefon}
                        onChange={e => setContactForm(p => ({...p, telefon: e.target.value}))}
                        className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">E-Posta</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={e => setContactForm(p => ({...p, email: e.target.value}))}
                      className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Mesaj</label>
                    <textarea
                      rows={4}
                      value={contactForm.mesaj}
                      onChange={e => setContactForm(p => ({...p, mesaj: e.target.value}))}
                      className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] resize-none"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    GÖNDER
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <h4 className="font-bebas text-2xl text-[#1a1a1a] tracking-wider mb-2">MESAJINIZ ALINDI!</h4>
                  <p className="text-[#555] font-montserrat text-sm">En kısa sürede sizinle iletişime geçeceğiz.</p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h3 className="font-bebas text-2xl tracking-wider text-[#1a1a1a] mb-6">İLETİŞİM BİLGİLERİ</h3>
                <div className="space-y-4">
                  {[
                    { icon: Phone, label: 'Telefon', value: '+90 544 684 40 67', href: 'tel:+905446844067' },
                    { icon: Mail, label: 'E-Posta', value: 'info@404dijital.com', href: 'mailto:info@404dijital.com' },
                    { icon: MapPin, label: 'Adres', value: 'Çınarlı 1572/1. Sk. No:33 35170 Konak/İzmir', href: '#' },
                  ].map(({ icon: Icon, label, value, href }, i) => (
                    <a key={i} href={href} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[#eaeaea] hover:border-[#1a1a1a] transition-colors group">
                      <div className="w-10 h-10 bg-[#1a1a1a] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#ffc107] transition-colors">
                        <Icon size={18} className="text-white group-hover:text-[#1a1a1a]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#999] font-montserrat uppercase tracking-wider">{label}</p>
                        <p className="text-[#1a1a1a] font-montserrat font-semibold text-sm mt-0.5">{value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-2xl p-6 text-white">
                <h4 className="font-bebas text-xl tracking-wider mb-4 text-[#ffc107]">HIZLI BAŞLANGIÇ</h4>
                <p className="text-gray-300 text-sm font-montserrat mb-4">
                  WhatsApp üzerinden hemen iletişime geçin, 5 dakikada ücretsiz analiz randevunuzu alın.
                </p>
                <a
                  href="https://wa.me/905446844067?text=Merhaba,%20ücretsiz%20analiz%20istiyorum."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white font-montserrat font-bold text-sm px-6 py-3 rounded-full hover:bg-[#1ea952] transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WHATSAPP'TAN YAZ
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
