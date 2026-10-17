"use client"
import { useState } from 'react'
import Link from 'next/link'
import { Phone, MessageCircle, Plus, CheckCircle2, XCircle, ExternalLink, ShieldCheck } from 'lucide-react'
import { trackLeadConversion, trackContactClick } from '@/lib/tracking'

const SOSYAL_KANIT = [
  { stat: '25x', label: 'Reklam Getirisi', title: 'Havuzumolsun', href: 'https://www.instagram.com/havuzumolsun/', logo: '/images/clients/havuzumolsun.jpg' },
  { stat: '1.2M', label: 'Google Görüntülenme', title: 'Ege Estetik Diş', href: 'https://www.egeestetikdis.com/', logo: '/images/clients/egeestetikdis.png', logoWide: true },
  { stat: '0 → 50K', label: 'Takipçi Büyümesi', title: 'BirTvYayin', href: 'https://www.instagram.com/birtvyayin/', logo: '/images/clients/birtvyayin.jpg' },
]

const SORULAR = [
  {
    q: '"3 ayda dönüşüm göremezsem paramı geri alırım" ne anlama geliyor, tam olarak?',
    a: '3 ay boyunca kampanyayı yönetiriz; hedeflenen nitelikli lead sayısına (görüşmede birlikte belirleriz) ulaşamazsak, o ay için ödediğiniz yönetim ücretini iade ederiz. Reklam bütçesi bu garantinin dışındadır — o tamamen sizin platform hesabınızda kalır, biz asla elinize para geçirmeden harcarız.',
  },
  {
    q: 'Daha önce bir ajansla çalıştım, parayı aldılar sonra ortadan kayboldular. Siz farklı mısınız?',
    a: 'Her hafta elle hazırladığımız raporu WhatsApp\'tan atıyoruz, sorularınıza 24 saat içinde dönüş garantisi veriyoruz. Reklam hesabınız sizin adınıza açılır — istediğiniz an erişiminizi geri alabilirsiniz, biz sadece yönetiriz.',
  },
  {
    q: 'Dekont veya fatura vermeyen, sözleşmesiz çalışan ajanslar gördüm. Sizde durum ne?',
    a: 'Her ödeme faturalıdır, her harcama raporludur. Sözleşmemiz net: süre, kapsam, garanti şartları yazılı olarak önceden belirlenir, elden/belgesiz ödeme talep etmeyiz.',
  },
  {
    q: 'Sektörümüzde deneyiminiz var mı?',
    a: 'Sağlık (sıkı reklam kurallarına tam uyumla), diş kliniği, e-ticaret, gayrimenkul, film prodüksiyon ve yerel hizmet işletmeleri dahil geniş bir portföyümüz var. Aşağıdaki "Sonuçlarımız" bölümünde gerçek müşterilerimizi inceleyebilirsiniz.',
  },
  {
    q: 'Uzun vadeli sözleşmeye bağlanmak istemiyorum.',
    a: 'Zorunlu uzun vadeli sözleşme dayatmıyoruz. Sonuç veremiyorsak sizi tutmamızın bir anlamı yok — ayrılmak istediğiniz an serbestsiniz.',
  },
  {
    q: '"Ayda X lead garantisi" gibi abartılı vaatlerde bulunan ajanslardan çok yoruldum.',
    a: 'Biz tahmini rakam değil, geçmiş kampanya verilerimizi göstererek konuşuruz. Analiz görüşmesinde sektörünüze ve bütçenize göre gerçekçi bir hedef birlikte belirleriz — kanıtlanamayan hiçbir sayıyı ağzımıza almayız.',
  },
  {
    q: 'Sadece İzmir\'e mi hizmet veriyorsunuz?',
    a: 'Evet, şu an sadece İzmir ve çevresindeki işletmelere hizmet veriyoruz — bu sayede her müşteriye yerinde, hızlı ve yakından ilgi gösterebiliyoruz.',
  },
  {
    q: 'Reklam bütçesi ajans ücretine dahil mi?',
    a: 'Hayır, tamamen ayrı. Reklam bütçeniz kendi hesabınızda, sizin kontrolünüzde kalır — biz sadece strateji ve yönetimi üstleniriz.',
  },
]

export default function SonucGarantisiLP() {
  const [formData, setFormData] = useState({ isletmeAdi: '', telefon: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    trackLeadConversion()
    try {
      await fetch('/api/iletisim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'analiz', ...formData, kaynak: 'LP - Sonuç Garantisi (Meta Ads)' }),
      })
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white">
      {/* MINIMAL TOP BAR */}
      <div className="border-b border-[#eaeaea]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bebas text-2xl tracking-[3px] text-[#1a1a1a]">404 DİJİTAL</Link>
          <div className="flex items-center gap-1.5 text-[#999] text-xs font-montserrat">
            <ShieldCheck size={14} className="text-green-600" /> Sadece İzmir'e hizmet veriyoruz
          </div>
        </div>
      </div>

      {/* EYEBROW SOCIAL PROOF */}
      <div className="bg-[#f8f9fa] border-b border-[#eaeaea] py-3 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-6 whitespace-nowrap">
          {SOSYAL_KANIT.map((s, i) => (
            <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-montserrat text-[#555] hover:text-[#1a1a1a] transition-colors">
              <span className="font-bebas text-sm text-[#1a1a1a] tracking-wide">{s.stat}</span> {s.title} <ExternalLink size={10} />
            </a>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 pb-10 text-center">
        <h1 className="font-bebas text-4xl md:text-6xl text-[#1a1a1a] tracking-wider leading-[1.05] mb-5">
          İZMİRLİ İŞLETME SAHİPLERİNE 3 AYDA NİTELİKLİ LEAD AKIŞI SAĞLIYORUZ — SONUÇ YOKSA PARANIZ İADE
        </h1>
        <p className="text-[#555] font-montserrat text-lg leading-relaxed max-w-2xl mx-auto mb-8">
          Reklama para yakıp hiçbir şey alamadığınız günler bitti. 404 Dijital'in garanti sistemiyle çalışırsanız, ya ölçülebilir nitelikli lead akışı görürsünüz, ya da ödediğiniz yönetim ücretini geri alırsınız. Riski biz üstleniyoruz.
        </p>

        {/* VSL PLACEHOLDER */}
        <div className="aspect-video bg-[#1a1a1a] rounded-2xl mb-8 flex items-center justify-center max-w-xl mx-auto">
          <p className="text-white/40 font-montserrat text-sm px-6 text-center">
            [ VSL / Müşteri Referans Videosu buraya gelecek — Furkan video dosyasını/linkini verince eklenecek ]
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <input
              type="text" placeholder="İşletme Adı" required
              value={formData.isletmeAdi}
              onChange={e => setFormData(p => ({ ...p, isletmeAdi: e.target.value }))}
              className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-3.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a]"
            />
            <input
              type="tel" placeholder="Telefon Numarası" required
              value={formData.telefon}
              onChange={e => setFormData(p => ({ ...p, telefon: e.target.value }))}
              className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-3.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a]"
            />
            <button type="submit" disabled={submitting} className="w-full bg-[#1a1a1a] text-white font-montserrat font-bold text-sm py-4 rounded-xl disabled:opacity-50">
              30 DAKİKALIK ÜCRETSİZ ANALİZ GÖRÜŞMEMİ AL
            </button>
            <p className="text-[#999] text-xs font-montserrat">
              Butona bas, formu doldur — satış ekibimiz 24 saat içinde seni arayıp 30 dakikalık ücretsiz analiz görüşmesi yapsın.
            </p>
          </form>
        ) : (
          <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-xl px-6 py-5">
            <p className="text-green-700 font-montserrat font-bold">✅ Talebin alındı!</p>
            <p className="text-green-600 text-sm mt-1 font-montserrat">24 saat içinde seni arayıp 30 dakikalık ücretsiz analiz görüşmesini ayarlayacağız.</p>
          </div>
        )}
      </section>

      {/* PROBLEM / NEDEN BAŞARISIZ OLUNUYOR */}
      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-[#ffc107] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4 text-center">TANIDIK GELİYOR MU?</p>
          <h2 className="font-bebas text-3xl md:text-5xl text-white tracking-wider leading-tight text-center mb-14">
            ÇOĞU İŞLETME SAHİBİ AYNI DUVARA ÇARPIYOR
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h3 className="font-montserrat font-bold text-white text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                <XCircle size={18} className="text-red-400" /> Diğer Ajanslarla Yaşananlar
              </h3>
              <ul className="space-y-4">
                {[
                  'Aylarca ödeme yapıyorsunuz, somut bir sonuç göremiyorsunuz.',
                  'Ödeme sonrası ajans soru sorduğunuzda yanıt vermiyor.',
                  '"Ayda 1000 lead" gibi vaatler veriliyor, gerçekleşmiyor.',
                  'Dekont, fatura, sözleşme olmadan nakit ödeme isteniyor.',
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-400 text-sm font-montserrat leading-relaxed">
                    <span className="text-red-400 mt-1">✕</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/5 border border-[#ffc107]/30 rounded-2xl p-8">
              <h3 className="font-montserrat font-bold text-[#ffc107] text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#ffc107]" /> 404 Dijital Sistemi
              </h3>
              <ul className="space-y-4">
                {[
                  '3 ayda hedeflenen nitelikli lead gelmezse yönetim ücreti iade.',
                  'Her hafta WhatsApp\'tan elle rapor, 24 saat içinde dönüş garantisi.',
                  'Sadece kanıtlanabilir, geçmiş veriye dayalı hedefler konuşuruz.',
                  'Her ödeme faturalı, hesabınız her zaman sizin adınıza.',
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-white text-sm font-montserrat leading-relaxed">
                    <span className="text-[#ffc107] mt-1">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* FORMUL */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto text-center">
            <p className="text-[#999] font-montserrat text-xs uppercase tracking-wider mb-3">Neden Çoğu Ajans Sonuç Getirmiyor?</p>
            <p className="text-white font-montserrat text-sm leading-relaxed mb-5">
              Çünkü içerik paylaşmakla reklam yönetmek birbirinden tamamen farklı işler. Çoğu "ajans" post atar, sonucu ölçmez, kampanyayı optimize etmez — bütçeniz havaya gider.
            </p>
            <p className="text-white font-montserrat text-sm leading-relaxed mb-5">
              Biz her kampanyayı net bir lead hedefine bağlarız, günlük veriyle optimize ederiz, hangi reklamın kaç nitelikli lead getirdiğini raporlarız.
            </p>
            <p className="font-bebas text-2xl text-[#ffc107] tracking-wider">404 PERFORMANS SİSTEMİ™</p>
          </div>
        </div>
      </section>

      {/* OFFER / GOD FATHER OFFER */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">TEKLİFİMİZ</p>
            <h2 className="font-bebas text-4xl md:text-5xl text-[#1a1a1a] tracking-wider">REDDETMESİ ZOR BİR TEKLİF</h2>
          </div>
          <div className="border-2 border-[#1a1a1a] rounded-2xl p-8 md:p-10">
            <ul className="space-y-4 mb-8">
              {[
                '30 dakikalık ücretsiz analiz görüşmesi + reklam hesabınızın ücretsiz denetimi',
                'Sektörünüze ve bütçenize özel, kanıta dayalı 3 aylık lead hedefi',
                '3 ayda hedef tutmazsa o ayın yönetim ücreti tam iade',
              ].map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#ffc107] text-black text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-[#1a1a1a] font-montserrat text-sm leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
            <div className="bg-[#f8f9fa] rounded-xl p-5 mb-6">
              <p className="text-[#555] font-montserrat text-xs leading-relaxed">
                <strong className="text-[#1a1a1a]">Garantimiz net:</strong> Reklam bütçesi değil, bizim performansımız garanti kapsamında. Hedeflenen nitelikli lead sayısına ulaşamazsak, yönetim ücretinizi tam iade ediyoruz — sorgusuz.
              </p>
            </div>
            <a
              href="#form"
              onClick={() => trackContactClick('whatsapp')}
              className="block w-full text-center bg-[#1a1a1a] text-white font-montserrat font-bold text-sm py-4 rounded-xl"
            >
              30 DAKİKALIK ÜCRETSİZ ANALİZ GÖRÜŞMEMİ AL
            </a>
          </div>
        </div>
      </section>

      {/* SOSYAL KANIT */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">GERÇEK MÜŞTERİLER, GERÇEK SONUÇLAR</p>
            <h2 className="font-bebas text-4xl md:text-5xl text-[#1a1a1a] tracking-wider">RAKAMLAR KONUŞUR</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {SOSYAL_KANIT.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="group bg-white rounded-2xl p-6 border border-[#eaeaea] hover:border-[#1a1a1a] hover:shadow-lg transition-all flex flex-col">
                <div className="font-bebas text-4xl text-[#1a1a1a] tracking-wider mb-1">{s.stat}</div>
                <div className="text-[#999] text-xs font-montserrat font-semibold uppercase tracking-wider mb-4">{s.label}</div>
                <div className="flex items-center gap-2 mb-2">
                  <img src={s.logo} alt={s.title} className={s.logoWide ? 'h-5 w-auto object-contain' : 'w-8 h-8 rounded-full object-cover border border-[#eaeaea]'} />
                  {!s.logoWide && <h4 className="font-montserrat font-bold text-sm text-[#1a1a1a]">{s.title}</h4>}
                </div>
                <div className="flex items-center gap-1 text-[#1a1a1a] text-xs font-montserrat font-semibold mt-4 opacity-60 group-hover:opacity-100 transition-opacity">
                  Profili İncele <ExternalLink size={12} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqBlock />

      {/* FINAL CTA */}
      <section id="form" className="py-20 bg-[#1a1a1a]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-bebas text-3xl md:text-4xl text-white tracking-wider mb-4">
            SONUÇ GARANTİLİ ÇALIŞMAYA HAZIR MISINIZ?
          </h2>
          <p className="text-gray-400 font-montserrat text-sm mb-8">
            30 dakikalık ücretsiz analiz görüşmesi için formu doldur, 24 saat içinde arayalım.
          </p>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text" placeholder="İşletme Adı" required
                value={formData.isletmeAdi}
                onChange={e => setFormData(p => ({ ...p, isletmeAdi: e.target.value }))}
                className="w-full border-2 border-white/10 bg-white/5 text-white placeholder:text-gray-500 rounded-xl px-4 py-3.5 text-sm font-montserrat focus:outline-none focus:border-white/30"
              />
              <input
                type="tel" placeholder="Telefon Numarası" required
                value={formData.telefon}
                onChange={e => setFormData(p => ({ ...p, telefon: e.target.value }))}
                className="w-full border-2 border-white/10 bg-white/5 text-white placeholder:text-gray-500 rounded-xl px-4 py-3.5 text-sm font-montserrat focus:outline-none focus:border-white/30"
              />
              <button type="submit" disabled={submitting} className="w-full bg-[#ffc107] text-black font-montserrat font-bold text-sm py-4 rounded-xl disabled:opacity-50">
                30 DAKİKALIK ÜCRETSİZ ANALİZ GÖRÜŞMEMİ AL
              </button>
            </form>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-6 py-5">
              <p className="text-green-400 font-montserrat font-bold">✅ Talebin alındı! 24 saat içinde arayacağız.</p>
            </div>
          )}
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a1a] border-t border-white/10 px-4 py-3 flex gap-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <a href="tel:+905446844067" onClick={() => trackContactClick('phone')} className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-montserrat font-bold text-sm py-3 rounded-full">
          <Phone size={16} /> ARA
        </a>
        <a href="https://wa.me/905446844067?text=Merhaba,%20ücretsiz%20analiz%20görüşmesi%20istiyorum." target="_blank" rel="noopener noreferrer" onClick={() => trackContactClick('whatsapp')} className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-montserrat font-bold text-sm py-3 rounded-full">
          <MessageCircle size={16} /> WHATSAPP
        </a>
      </div>
    </div>
  )
}

function FaqBlock() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">AKLINIZDA SORU KALMASIN</p>
          <h2 className="font-bebas text-4xl md:text-5xl text-[#1a1a1a] tracking-wider">SIK SORULAN SORULAR</h2>
        </div>
        <div className="space-y-3">
          {SORULAR.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={i} className="border border-[#eaeaea] rounded-2xl overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-[#f8f9fa] hover:bg-[#f0f1f2] transition-colors" aria-expanded={isOpen}>
                  <span className="font-montserrat font-semibold text-[#1a1a1a] text-sm">{item.q}</span>
                  <Plus size={18} className={`flex-shrink-0 text-[#1a1a1a] transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 py-5 bg-white">
                    <p className="text-[#555] text-sm font-montserrat leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
