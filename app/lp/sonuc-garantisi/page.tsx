"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, MessageCircle, Plus, CheckCircle2, XCircle, ExternalLink, ShieldCheck, Star } from 'lucide-react'
import { trackLeadConversion, trackContactClick } from '@/lib/tracking'

const SOSYAL_KANIT = [
  { stat: '25x', label: 'Reklam Getirisi', title: 'Havuzumolsun', href: 'https://www.instagram.com/havuzumolsun/', logo: '/images/clients/havuzumolsun.jpg' },
  { stat: '1.2M', label: 'Google Görüntülenme', title: 'Ege Estetik Diş', href: 'https://www.egeestetikdis.com/', logo: '/images/clients/egeestetikdis.png', logoWide: true },
  { stat: '0 → 50K', label: 'Takipçi Büyümesi', title: 'BirTvYayin', href: 'https://www.instagram.com/birtvyayin/', logo: '/images/clients/birtvyayin.jpg' },
  { stat: '0₺ Bütçe', label: 'Organik Büyüme', title: 'Ballicams', href: 'https://www.instagram.com/ballicams/', logo: '/images/clients/ballicams.jpg' },
  { stat: '0 İhlal', label: 'Sağlık Reklamı Uyumu', title: 'Dr. Aycan Akçalı', href: 'https://www.instagram.com/dr.aycanakcali/', logo: '/images/clients/dr-aycanakcali.jpg' },
]

const YORUMLAR = [
  { yorum: '"Aylarca farklı ajanslarla para yaktıktan sonra 404 Dijital ile ilk kez hesap tablosunda gerçek bir fark gördüm."', isim: 'Gerçek müşteri geri bildirimi' },
  { yorum: '"Sorduğum her soruya aynı gün cevap alıyorum, önceki ajansımdan 3 hafta cevap bekliyordum."', isim: 'Gerçek müşteri geri bildirimi' },
  { yorum: '"Reklam hesabım hâlâ benim adıma, istediğim an kontrol edebiliyorum. İlk kez bu kadar şeffaf çalıştım."', isim: 'Gerçek müşteri geri bildirimi' },
]

const KIMIN_ICIN = [
  'Diş kliniği, estetik merkezi, fizyoterapi gibi bir sağlık işletmeniz var ve bekleme odanızın dolu olmasını istiyorsunuz?',
  'Emlakçı veya müteahhitsiniz, cebi dolu ve satın almaya hazır alıcılarla konuşmak istiyorsunuz?',
  'Restoran, kafe veya mekan işletiyorsunuz, masalarınızın her akşam dolu olmasını istiyorsunuz?',
  'E-ticaret / D2C markanız var, reklam harcadığınız her kuruşun nereye gittiğini bilmek istiyorsunuz?',
  'Hizmet veya danışmanlık veriyorsunuz, takviminizin "görüşme talebi" ile dolmasını istiyorsunuz?',
  'Prodüksiyon, üretim veya B2B işindesiniz, telefonun sürekli çalmasını istiyorsunuz?',
]

const NELER_VAR = [
  'Reklam hesabınızın tamamen ücretsiz denetimi — şu an nerede, nasıl para kaybettiğinizi gözünüzle görürsünüz.',
  'Sektörünüze ve bütçenize özel, geçmiş kampanya verilerine dayanan gerçekçi 3 aylık nitelikli lead hedefi.',
  'Hangi reklamın kaç nitelikli lead getirdiğini her hafta gün gün gösteren şeffaf rapor.',
  'Reklam hesabınız baştan sona sizin adınıza — biz sadece yönetiriz, istediğiniz an erişiminizi geri alabilirsiniz.',
  '3 ay boyunca hedeflediğimiz nitelikli lead sayısına ulaşamazsak, o ayın yönetim ücretini tam iade ediyoruz.',
]

const SORULAR = [
  { q: '"3 ayda dönüşüm göremezsem paramı geri alırım" ne anlama geliyor, tam olarak?', a: '3 ay boyunca kampanyayı yönetiriz; görüşmede birlikte belirlediğimiz nitelikli lead hedefine ulaşamazsak, o ay için ödediğiniz yönetim ücretini iade ederiz. Reklam bütçesi bu garantinin dışındadır — o tamamen sizin platform hesabınızda kalır, biz asla elinize para geçirmeden, sizin adınıza açılmış hesaptan harcarız.' },
  { q: 'Daha önce bir ajansla çalıştım, parayı aldılar sonra ortadan kayboldular. Siz farklı mısınız?', a: 'Her hafta elle hazırladığımız raporu WhatsApp\'tan atıyoruz, sorularınıza 24 saat içinde dönüş garantisi veriyoruz. Reklam hesabınız sizin adınıza açılır — istediğiniz an erişiminizi geri alabilirsiniz, biz sadece yönetiriz.' },
  { q: 'Dekont veya fatura vermeyen, sözleşmesiz çalışan ajanslar gördüm. Sizde durum ne?', a: 'Her ödeme faturalıdır, her harcama raporludur. Sözleşmemiz net: süre, kapsam, garanti şartları yazılı olarak önceden belirlenir, elden/belgesiz ödeme talep etmeyiz.' },
  { q: 'Sektörümüzde deneyiminiz var mı?', a: 'Sağlık (sıkı reklam kurallarına tam uyumla), diş kliniği, e-ticaret, gayrimenkul, film prodüksiyon ve yerel hizmet işletmeleri dahil geniş bir portföyümüz var. Yukarıdaki "Rakamlar Konuşur" bölümünde gerçek müşterilerimizi inceleyebilirsiniz.' },
  { q: 'Uzun vadeli sözleşmeye bağlanmak istemiyorum.', a: 'Zorunlu uzun vadeli sözleşme dayatmıyoruz. Sonuç veremiyorsak sizi tutmamızın bir anlamı yok — ayrılmak istediğiniz an serbestsiniz.' },
  { q: '"Ayda X lead garantisi" gibi abartılı vaatlerde bulunan ajanslardan çok yoruldum.', a: 'Biz tahmini rakam değil, geçmiş kampanya verilerimizi göstererek konuşuruz. Ücretsiz analiz görüşmesinde sektörünüze ve bütçenize göre gerçekçi bir hedef birlikte belirleriz — kanıtlanamayan hiçbir sayıyı ağzımıza almayız.' },
  { q: 'Sadece İzmir\'e mi hizmet veriyorsunuz?', a: 'Evet, şu an sadece İzmir ve çevresindeki işletmelere hizmet veriyoruz. Bunun bir sebebi var: her müşteriye yerinde, hızlı ve yakından ilgi gösterebilmek için kasıtlı olarak az sayıda işletmeyle çalışıyoruz. Bu yüzden ayda sınırlı sayıda yeni müşteri kabul ediyoruz.' },
  { q: 'Reklam bütçesi ajans ücretine dahil mi?', a: 'Hayır, tamamen ayrı. Reklam bütçeniz kendi hesabınızda, sizin kontrolünüzde kalır — biz sadece strateji ve yönetimi üstleniriz.' },
  { q: 'Analiz görüşmesi gerçekten ücretsiz mi, bir yere imza atmam mı gerekecek?', a: 'Tamamen ücretsiz, hiçbir yükümlülük yok. 30 dakikada mevcut durumunuzu, reklam hesabınızı inceleriz ve size gerçekçi bir yol haritası çizeriz. Devam etmek isteyip istemediğinize görüşme sonunda siz karar verirsiniz.' },
  { q: 'Analiz görüşmesinden sonra ne olacak?', a: 'Görüşmede sizin için anlamlı olup olmadığımıza birlikte karar veririz. Uygunsa, sözleşme ve garanti şartlarını netleştirir, kampanyanızı kurmaya başlarız. Uygun değilse, hiçbir baskı yapmadan yolunuza devam edersiniz.' },
]

export default function SonucGarantisiLP() {
  const [formData, setFormData] = useState({ isletmeAdi: '', telefon: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [reklamDetay, setReklamDetay] = useState('')
  useEffect(() => {
    if (typeof window === 'undefined') return
    const qs = window.location.search
    if (qs) setReklamDetay(qs.replace(/^\?/, ''))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    trackLeadConversion()
    try {
      await fetch('/api/iletisim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'analiz', ...formData, reklamDetay, kaynak: 'LP - Sonuç Garantisi (Meta Ads)' }),
      })
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const CTAForm = ({ dark = false }: { dark?: boolean }) => (
    !submitted ? (
      <form onSubmit={handleSubmit} className="space-y-3 max-w-md mx-auto">
        <input
          type="text" placeholder="İşletme Adı" required
          value={formData.isletmeAdi}
          onChange={e => setFormData(p => ({ ...p, isletmeAdi: e.target.value }))}
          className={dark ? "w-full border-2 border-white/10 bg-white/5 text-white placeholder:text-gray-500 rounded-xl px-4 py-3.5 text-sm font-montserrat focus:outline-none focus:border-white/30" : "w-full border-2 border-[#eaeaea] rounded-xl px-4 py-3.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a]"}
        />
        <input
          type="tel" placeholder="Telefon Numarası" required
          value={formData.telefon}
          onChange={e => setFormData(p => ({ ...p, telefon: e.target.value }))}
          className={dark ? "w-full border-2 border-white/10 bg-white/5 text-white placeholder:text-gray-500 rounded-xl px-4 py-3.5 text-sm font-montserrat focus:outline-none focus:border-white/30" : "w-full border-2 border-[#eaeaea] rounded-xl px-4 py-3.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a]"}
        />
        <button type="submit" disabled={submitting} className={dark ? "w-full bg-[#ffc107] text-black font-montserrat font-bold text-sm py-4 rounded-xl disabled:opacity-50" : "w-full bg-[#1a1a1a] text-white font-montserrat font-bold text-sm py-4 rounded-xl disabled:opacity-50"}>
          ÜCRETSİZ ANALİZ GÖRÜŞMEMİ AYIRT
        </button>
        <p className={dark ? "text-gray-400 text-xs font-montserrat" : "text-[#999] text-xs font-montserrat"}>
          Butona bas, formu doldur — satış ekibimiz 24 saat içinde seni arayıp 30 dakikalık ücretsiz analiz görüşmesi yapsın.
        </p>
      </form>
    ) : (
      <div className={dark ? "max-w-md mx-auto bg-green-500/10 border border-green-500/30 rounded-xl px-6 py-5" : "max-w-md mx-auto bg-green-50 border border-green-200 rounded-xl px-6 py-5"}>
        <p className={dark ? "text-green-400 font-montserrat font-bold" : "text-green-700 font-montserrat font-bold"}>✅ Talebin alındı!</p>
        <p className={dark ? "text-green-500 text-sm mt-1 font-montserrat" : "text-green-600 text-sm mt-1 font-montserrat"}>24 saat içinde seni arayıp 30 dakikalık ücretsiz analiz görüşmesini ayarlayacağız.</p>
      </div>
    )
  )

  return (
    <div className="bg-white">
      {/* URGENCY BAR */}
      <div className="bg-[#1a1a1a] text-white text-center py-2.5 px-4">
        <p className="text-xs font-montserrat font-semibold tracking-wide">
          ⚠️ Sadece İzmir'e hizmet veriyoruz ve ayda sınırlı sayıda yeni işletme alıyoruz — kalite için kasıtlı olarak az sayıda müşteriyle çalışıyoruz.
        </p>
      </div>

      {/* MINIMAL TOP BAR */}
      <div className="border-b border-[#eaeaea]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bebas text-2xl tracking-[3px] text-[#1a1a1a]">404 DİJİTAL</Link>
          <div className="hidden sm:flex items-center gap-1.5 text-[#999] text-xs font-montserrat">
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
        <div className="flex items-center justify-center gap-1 mb-4">
          {[1,2,3,4,5].map(i => <Star key={i} size={16} className="fill-[#ffc107] text-[#ffc107]" />)}
          <span className="text-xs font-montserrat text-[#999] ml-2">50+ İzmirli işletmenin tercihi</span>
        </div>
        <h1 className="font-bebas text-4xl md:text-6xl text-[#1a1a1a] tracking-wider leading-[1.05] mb-5">
          İZMİRLİ İŞLETME SAHİPLERİNE 3 AYDA NİTELİKLİ LEAD AKIŞI SAĞLIYORUZ — SONUÇ YOKSA PARANIZ İADE
        </h1>
        <p className="text-[#555] font-montserrat text-lg leading-relaxed max-w-2xl mx-auto mb-8">
          Reklama para yakıp hiçbir şey alamadığınız günler bitti. 404 Dijital'in garanti sistemiyle çalışırsanız, ya ölçülebilir nitelikli lead akışı görürsünüz, ya da ödediğiniz yönetim ücretini geri alırsınız. Riski biz üstleniyoruz.
        </p>

        {/* VSL / MÜŞTERİ REFERANS VİDEOSU — tıkla ve oynat, performans için erken yüklenmiyor */}
        <VideoEmbed />

        <CTAForm />
      </section>

      {/* MARKA HİKAYESİ */}
      <section className="py-20 bg-white border-t border-[#eaeaea]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <p className="text-[#999] font-montserrat text-xs uppercase tracking-wider mb-10">404 DİJİTAL, İZMİR</p>

          <div className="font-montserrat text-[#333] text-base leading-[1.9] space-y-5">
            <p>Biz 404 Dijital'iz.</p>
            <p>Google'ın ilk kurulduğu yıllarda, 404 numaralı bir uçuş gerçekleşti.</p>
            <p>Bu uçaktan bir daha hiç haber alınamadı.</p>
            <p>Google da, ulaşamadığı sayfalara bu uçuşa bir saygı duruşu olarak <strong>"404 Not Found"</strong> demeye başladı.</p>
            <p>Biz de İzmir'e döndüğümüzde benzer bir boşluk gördük.</p>
            <p>Viral olmuş içerikleri taklit etmek üzerine kurulu, işletmelere hiçbir fayda getirmeyen, sadece ay sonunda fatura kesmek için var olan onlarca "sosyal medya ajansı" vardı.</p>
            <p><strong>Biz bir sosyal medya ajansı değiliz.</strong></p>
            <p><strong>Biz bir reklam ajansıyız.</strong></p>
            <p>Reklamcılığın babası sayılan David Ogilvy'nin dediği gibi:</p>
            <p className="font-bold text-[#1a1a1a]">"Satmıyorsa yaratıcı değildir."</p>
            <p>Bu felsefeyle, işletmelere maksimum faydayı sağlamak için kurulduk. Kurulduğumuz ilk günden bu yana sektörde emin adımlarla ilerliyoruz.</p>
            <p>Çünkü inanıyoruz ki: güçlü şehir, güçlü markalarla; güçlü markalar ise güçlü reklamlarla doğar.</p>
            <p>Her sektörün merkezi sayılan İstanbul'un gölgesinden çıkmak için İzmir'de kurulduk. Ve şu an, tüm Türkiye'ye hizmet verecek bir noktaya doğru evriliyoruz.</p>
            <p>Ve sonuçlar bunu kanıtlıyor:</p>
            <p>Havuzumolsun'a sadece 20.000₺ reklam bütçesiyle 500.000₺ ciro kazandırdık — <strong>25 kat getiri</strong>.</p>
            <p>Dr. Aycan Akçalı'yı 700 takipçiden başlattık, sağlık sektörünün en katı reklam kurallarına rağmen tek bir uyarı bile almadan büyüttük.</p>
            <p>Ege Estetik Diş'i kuruluşundan beraber yürüttük, Google'da <strong>1.2 milyon görüntülenme</strong> yakaladık.</p>
            <p>BirTvYayin'i sıfırdan 50.000 takipçiye taşıdık.</p>
            <p>Ve bunları sağlık, diş, e-ticaret, gayrimenkul, prodüksiyon ve daha pek çok sektörde tekrar tekrar yaptık.</p>
            <p>Ama şunu da öğrendik: İşletme sahiplerinin çoğu, bize ulaşmadan önce en az bir kere kötü bir ajans deneyimi yaşamış oluyor.</p>
            <p>Para ödüyorlar, sonuç alamıyorlar. Ajans ortadan kayboluyor. Kimse hesap vermiyor.</p>
            <p>Bu yüzden 404 Dijital'de işleri biraz farklı yapıyoruz.</p>
            <p><strong>Sonucu garanti ediyoruz.</strong></p>
            <p>3 ay boyunca sizinle çalışırız. Birlikte belirlediğimiz nitelikli lead hedefine ulaşamazsak, o ayın yönetim ücretini geri alırsınız.</p>
            <p>Riski biz üstleniyoruz, siz değil.</p>
            <p>Devam edelim mi?</p>
          </div>

          <div className="mt-10">
            <CTAForm />
          </div>
        </div>
      </section>

      {/* KIMIN ICIN */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">BU TEKLİF KİMİN İÇİN?</p>
            <h2 className="font-bebas text-3xl md:text-5xl text-[#1a1a1a] tracking-wider">AŞAĞIDAKİLERDEN BİRİNE "EVET" DİYORSANIZ...</h2>
          </div>
          <div className="space-y-4">
            {KIMIN_ICIN.map((s, i) => (
              <div key={i} className="flex items-start gap-4 bg-white rounded-xl p-5 border border-[#eaeaea]">
                <CheckCircle2 size={20} className="text-[#1a1a1a] flex-shrink-0 mt-0.5" />
                <p className="text-[#333] font-montserrat text-sm leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[#555] font-montserrat text-base mt-10 mb-6 font-semibold">
            Bunlardan birine bile "evet" dediyseniz, bu sayfanın geri kalanını okumalısınız.
          </p>
          <CTAForm />
        </div>
      </section>

      {/* NELER VAR */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">ÜCRETSİZ ANALİZ GÖRÜŞMESİNDE</p>
            <h2 className="font-bebas text-3xl md:text-5xl text-[#1a1a1a] tracking-wider">TAM OLARAK NE ALIYORSUNUZ?</h2>
          </div>
          <div className="space-y-4">
            {NELER_VAR.map((s, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="w-7 h-7 rounded-full bg-[#1a1a1a] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-[#333] font-montserrat text-sm leading-relaxed pt-0.5">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AMA BENIM ISLETMEM FARKLI - OBJECTION HANDLING */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="font-bebas text-3xl md:text-4xl text-[#1a1a1a] tracking-wider mb-6 text-center">
            "AMA BENİM İŞLETMEM FARKLI, BU BENDE İŞE YARAMAZ"
          </h2>
          <div className="font-montserrat text-[#555] text-base leading-[1.9] space-y-4">
            <p>Muhtemelen şu an aklından bu geçiyor.</p>
            <p>Anlıyorum — sektörünüz özel, müşterileriniz farklı, piyasa koşullarınız kendine has diye düşünüyorsunuz.</p>
            <p>Ama şunu söyleyebilirim: Sağlık, diş, gayrimenkul, e-ticaret, prodüksiyon, yerel hizmet işletmeleri dahil onlarca farklı sektörde çalıştık.</p>
            <p>Sağlık sektöründe Meta ve Google'ın en katı reklam kurallarına tam uyumla sıfır ihlal ile sonuç aldık.</p>
            <p>20.000₺ gibi küçük bütçelerle bile 25 kat getiri sağladık.</p>
            <p>Yani "işim farklı" demeden önce, en azından 30 dakikalık ücretsiz analiz görüşmesinde bizi test edin. Kaybedecek hiçbir şeyiniz yok — görüşme tamamen ücretsiz ve yükümlülüksüz.</p>
          </div>
        </div>
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
                  'Reklam hesabınız ajansın elinde kilitli kalıyor.',
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
                  'İstediğiniz an ayrılabilirsiniz, zorunlu uzun sözleşme yok.',
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-white text-sm font-montserrat leading-relaxed">
                    <span className="text-[#ffc107] mt-1">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* FORMUL */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto text-center mb-10">
            <p className="text-[#999] font-montserrat text-xs uppercase tracking-wider mb-3">Neden Çoğu Ajans Sonuç Getirmiyor?</p>
            <p className="text-white font-montserrat text-sm leading-relaxed mb-5">
              Çünkü içerik paylaşmakla reklam yönetmek birbirinden tamamen farklı işler. Çoğu "ajans" post atar, sonucu ölçmez, kampanyayı optimize etmez — bütçeniz havaya gider.
            </p>
            <p className="text-white font-montserrat text-sm leading-relaxed mb-5">
              Biz her kampanyayı net bir lead hedefine bağlarız, günlük veriyle optimize ederiz, hangi reklamın kaç nitelikli lead getirdiğini raporlarız.
            </p>
            <p className="font-bebas text-2xl text-[#ffc107] tracking-wider">404 PERFORMANS SİSTEMİ™</p>
          </div>

          <div className="max-w-md mx-auto">
            <CTAForm dark />
          </div>
        </div>
      </section>

      {/* YORUMLAR */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">MÜŞTERİLERİMİZ NE DİYOR</p>
            <h2 className="font-bebas text-4xl md:text-5xl text-[#1a1a1a] tracking-wider">ONLAR DA SİZİN GİBİ DÜŞÜNÜYORDU</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {YORUMLAR.map((y, i) => (
              <div key={i} className="bg-[#f8f9fa] rounded-2xl p-6 border border-[#eaeaea]">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(n => <Star key={n} size={13} className="fill-[#ffc107] text-[#ffc107]" />)}
                </div>
                <p className="text-[#333] font-montserrat text-sm leading-relaxed mb-4">{y.yorum}</p>
                <p className="text-[#999] font-montserrat text-xs">{y.isim}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFER / GOD FATHER OFFER */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">TEKLİFİMİZ</p>
            <h2 className="font-bebas text-4xl md:text-5xl text-[#1a1a1a] tracking-wider">REDDETMESİ ZOR BİR TEKLİF</h2>
          </div>
          <div className="border-2 border-[#1a1a1a] rounded-2xl p-8 md:p-10 bg-white">
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

            <div className="border-t border-[#eaeaea] pt-8 mb-8">
              <p className="font-bebas text-xl text-[#1a1a1a] tracking-wider mb-5">ÜSTÜNE 3 HEDİYE BONUS</p>
              <div className="space-y-5">
                <div>
                  <p className="font-montserrat font-bold text-sm text-[#1a1a1a] mb-1">BONUS #1 — Ücretsiz Reklam Hesabı Denetim Raporu</p>
                  <p className="text-[#555] font-montserrat text-xs leading-relaxed">Mevcut reklamlarınızı (varsa) analiz edip nerede para kaybettiğinizi gösteren detaylı bir rapor hazırlıyoruz. Bizimle çalışmasanız bile bu rapor sizde kalır.</p>
                </div>
                <div>
                  <p className="font-montserrat font-bold text-sm text-[#1a1a1a] mb-1">BONUS #2 — Rakip Analizi</p>
                  <p className="text-[#555] font-montserrat text-xs leading-relaxed">Bölgenizdeki rakiplerinizin reklamda ve sosyal medyada ne yaptığını analiz edip nerede açık olduğunuzu gösteriyoruz.</p>
                </div>
                <div>
                  <p className="font-montserrat font-bold text-sm text-[#1a1a1a] mb-1">BONUS #3 — İlk Ay Öncelikli Destek Hattı</p>
                  <p className="text-[#555] font-montserrat text-xs leading-relaxed">Bizimle başlarsanız ilk ay boyunca direkt WhatsApp hattımızdan öncelikli, aynı gün yanıt garantisi.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-6 mb-6">
              <p className="text-[#ffc107] font-bebas text-lg tracking-wider mb-2">SONUÇ GARANTİMİZ</p>
              <p className="text-white font-montserrat text-xs leading-relaxed">
                Reklam bütçesi değil, bizim performansımız garanti kapsamında. Hedeflenen nitelikli lead sayısına ulaşamazsak, yönetim ücretinizi tam iade ediyoruz — sorgusuz. Bu konuda bu kadar net duran başka bir ajans bulamazsınız.
              </p>
            </div>

            <CTAForm />
          </div>
        </div>
      </section>

      {/* SOSYAL KANIT */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">GERÇEK MÜŞTERİLER, GERÇEK SONUÇLAR</p>
            <h2 className="font-bebas text-4xl md:text-5xl text-[#1a1a1a] tracking-wider">RAKAMLAR KONUŞUR</h2>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
            {SOSYAL_KANIT.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="group bg-[#f8f9fa] rounded-2xl p-6 border border-[#eaeaea] hover:border-[#1a1a1a] hover:shadow-lg transition-all flex flex-col">
                <div className="font-bebas text-4xl text-[#1a1a1a] tracking-wider mb-1">{s.stat}</div>
                <div className="text-[#999] text-xs font-montserrat font-semibold uppercase tracking-wider mb-4">{s.label}</div>
                <div className="flex items-center gap-2 mb-2">
                  <Image src={s.logo} alt={s.title} width={s.logoWide ? 100 : 32} height={32} unoptimized className={s.logoWide ? 'h-5 w-auto object-contain' : 'w-8 h-8 rounded-full object-cover border border-[#eaeaea]'} />
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

      {/* FINAL CTA + PS */}
      <section id="form" className="py-20 bg-[#1a1a1a]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-bebas text-3xl md:text-4xl text-white tracking-wider mb-4">
            SONUÇ GARANTİLİ ÇALIŞMAYA HAZIR MISINIZ?
          </h2>
          <p className="text-gray-400 font-montserrat text-sm mb-8">
            30 dakikalık ücretsiz analiz görüşmesi için formu doldur, 24 saat içinde arayalım. Ayda sadece sınırlı sayıda yeni işletme alıyoruz.
          </p>
          <CTAForm dark />

          <div className="mt-14 pt-10 border-t border-white/10 text-left font-montserrat text-sm text-gray-400 leading-relaxed space-y-4">
            <p className="text-white font-semibold">Not:</p>
            <p>Buraya kadar okuduysan, muhtemelen daha önce en az bir kere kötü bir ajans deneyimi yaşadın. Biz de bunu biliyoruz, çünkü bu şikayeti onlarca kez duyduk.</p>
            <p>Bu yüzden riski biz üstleniyoruz: 3 ayda hedeflediğimiz sonucu getiremezsek, o ayın ücretini geri alırsın. Kaybedecek bir şeyin yok.</p>
            <p className="text-white font-semibold">Not 2:</p>
            <p>Ayda sadece sınırlı sayıda yeni işletme alıyoruz çünkü her müşteriye gerçekten zaman ayırmak istiyoruz. Yer dolmadan formu doldur.</p>
          </div>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a1a] border-t border-white/10 px-4 py-3 flex gap-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <a href="tel:+905446844067" onClick={() => trackContactClick('phone')} className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-montserrat font-bold text-sm py-3 rounded-full">
          <Phone size={16} /> ARA
        </a>
        <a href="https://wa.me/905515370404?text=Merhaba,%20ücretsiz%20analiz%20görüşmesi%20istiyorum." target="_blank" rel="noopener noreferrer" onClick={() => trackContactClick('whatsapp')} className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-montserrat font-bold text-sm py-3 rounded-full">
          <MessageCircle size={16} /> WHATSAPP
        </a>
      </div>

      {/* MASAÜSTÜ FLOATING CTA */}
      <a
        href="https://wa.me/905515370404?text=Merhaba,%20ücretsiz%20analiz%20görüşmesi%20istiyorum."
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackContactClick('whatsapp')}
        className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2.5 bg-[#25D366] text-white font-montserrat font-bold text-sm pl-4 pr-5 py-3.5 rounded-full shadow-xl hover:scale-105 transition-transform"
      >
        <MessageCircle size={18} /> Ücretsiz Toplantı İste
      </a>
    </div>
  )
}

function FaqBlock() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="py-20 bg-[#f8f9fa]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">AKLINIZDA SORU KALMASIN</p>
          <h2 className="font-bebas text-4xl md:text-5xl text-[#1a1a1a] tracking-wider">SIK SORULAN SORULAR</h2>
        </div>
        <div className="space-y-3">
          {SORULAR.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={i} className="border border-[#eaeaea] rounded-2xl overflow-hidden bg-white">
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-[#f8f9fa] transition-colors" aria-expanded={isOpen}>
                  <span className="font-montserrat font-semibold text-[#1a1a1a] text-sm">{item.q}</span>
                  <Plus size={18} className={`flex-shrink-0 text-[#1a1a1a] transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 py-5 bg-white border-t border-[#eaeaea]">
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

function VideoEmbed() {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="aspect-video bg-[#1a1a1a] rounded-2xl mb-8 overflow-hidden max-w-xl mx-auto relative">
      {playing ? (
        <iframe
          src="https://player.vimeo.com/video/1236967375?autoplay=1&title=0&byline=0&portrait=0"
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Müşteri referans videosu"
        />
      ) : (
        <button
          onClick={() => setPlaying(true)}
          className="w-full h-full flex flex-col items-center justify-center gap-3 group"
          aria-label="Videoyu oynat"
        >
          <span className="w-16 h-16 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white ml-1"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span className="text-white/60 font-montserrat text-xs">Müşteri referans videosunu izle</span>
        </button>
      )}
    </div>
  )
}
