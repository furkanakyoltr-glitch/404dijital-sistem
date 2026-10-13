"use client"
import { useState } from 'react'
import { Plus } from 'lucide-react'

const SORULAR = [
  {
    q: 'Sözleşme süresi ne kadar, bırakırsam ceza öder miyim?',
    a: 'Uzun vadeli zorunlu sözleşme dayatmıyoruz. Sonuç veremiyorsak sizi tutmamızın anlamı yok — ayrılmak istediğinizde serbestsiniz.',
  },
  {
    q: 'Sonuçları ne zaman görmeye başlarım?',
    a: 'İlk 24 saatte iletişime geçiyoruz, ilk hafta strateji ve kurulum tamamlanıyor. Reklam kampanyalarında ilk somut veriler genelde 2-3 hafta içinde, organik büyümede 4-6 hafta içinde görülüyor.',
  },
  {
    q: 'Bizim sektörümüzde deneyiminiz var mı?',
    a: 'Sağlık (sıkı reklam kurallarına tam uyumla), diş kliniği, e-ticaret, gayrimenkul, film prodüksiyon ve yerel hizmet işletmeleri dahil geniş bir portföyümüz var. "Sonuçlarımız" bölümünde gerçek müşterilerimizi inceleyebilirsiniz.',
  },
  {
    q: 'Reklam bütçesi ajans ücretine dahil mi?',
    a: 'Hayır, ayrı tutuyoruz. Reklam bütçeniz tamamen sizin kontrolünüzde kalır, biz sadece yönetim ve stratejiyi üstleniriz — şeffaflık için.',
  },
  {
    q: 'Küçük bir işletmeyiz, bize uygun mu?',
    a: 'Evet. Havuzumolsun örneğinde olduğu gibi 20.000₺ gibi görece küçük bütçelerle de somut ciro artışı sağlayabiliyoruz. Paket seçimini işletmenizin büyüklüğüne göre birlikte belirleriz.',
  },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="sss" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">AKLINIZDA SORU KALMASIN</p>
          <h2 className="font-bebas text-5xl text-[#1a1a1a] tracking-wider">SIK SORULAN SORULAR</h2>
        </div>

        <div className="space-y-3">
          {SORULAR.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={i} className="border border-[#eaeaea] rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-[#f8f9fa] hover:bg-[#f0f1f2] transition-colors"
                  aria-expanded={isOpen}
                >
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
