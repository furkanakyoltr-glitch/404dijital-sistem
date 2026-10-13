"use client"
import { XCircle, CheckCircle2 } from 'lucide-react'

const SORUNLAR = [
  'Her ay sosyal medyaya içerik atıyorsunuz ama telefon çalmıyor.',
  'Reklam bütçeniz gidiyor, kaç müşteri geldiğini bilmiyorsunuz.',
  'Rakipleriniz Google\'da üstte çıkıyor, siz 2. sayfadasınız.',
  'Ajans değiştirdiniz, hep aynı "biraz daha bekleyin" cevabını aldınız.',
]

const COZUMLER = [
  'Her kampanya net bir satış hedefine bağlanır, içerik için içerik atılmaz.',
  'Hangi reklamın kaç müşteri getirdiğini gün gün raporlarız.',
  'Arama sonuçlarında ve reklamlarda rakibinizin önüne geçiririz.',
  '24 saat içinde dönüş, aylık şeffaf performans toplantısı.',
]

export function ProblemSection() {
  return (
    <section className="py-24 bg-[#1a1a1a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-[#ffc107] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">TANIDIK GELİYOR MU?</p>
          <h2 className="font-bebas text-4xl md:text-5xl text-white tracking-wider leading-tight">
            ÇOĞU İŞLETME SAHİBİ AYNI DUVARA ÇARPIYOR
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="font-montserrat font-bold text-white text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
              <XCircle size={18} className="text-red-400" /> Şu An Yaşadığınız
            </h3>
            <ul className="space-y-4">
              {SORUNLAR.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-400 text-sm font-montserrat leading-relaxed">
                  <span className="text-red-400 mt-1">✕</span>{s}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/5 border border-[#ffc107]/30 rounded-2xl p-8">
            <h3 className="font-montserrat font-bold text-[#ffc107] text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#ffc107]" /> 404 Dijital İle Farkı
            </h3>
            <ul className="space-y-4">
              {COZUMLER.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-white text-sm font-montserrat leading-relaxed">
                  <span className="text-[#ffc107] mt-1">✓</span>{s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
