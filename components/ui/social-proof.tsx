"use client"
import { ExternalLink } from 'lucide-react'
import { InstagramEmbed } from './instagram-embed'

const SONUCLAR = [
  {
    stat: '25x',
    statLabel: 'Reklam Getirisi',
    title: 'Havuzumolsun',
    desc: 'Sadece 20.000₺ reklam bütçesiyle 500.000₺ ciro kazandırdık.',
    href: 'https://www.instagram.com/havuzumolsun/',
    logo: '/images/clients/havuzumolsun.jpg',
  },
  {
    stat: '0 İhlal',
    statLabel: 'Sağlık Reklamı Uyumu',
    title: 'Dr. Aycan Akçalı',
    desc: '700 takipçiden başladık. Sağlık sektörünün katı reklam yasaklarına rağmen tek bir uyarı bile almadan kusursuz ilerliyoruz.',
    href: 'https://www.instagram.com/dr.aycanakcali/',
    logo: '/images/clients/dr-aycanakcali.jpg',
  },
  {
    stat: '1.2M',
    statLabel: 'Google Görüntülenme',
    title: 'Ege Estetik Diş',
    desc: 'Kuruluş aşamasından beraber yürüdük, Google\'da 1.2 milyon görüntülenme yakaladık.',
    href: 'https://www.egeestetikdis.com/',
    logo: '/images/clients/egeestetikdis.png',
    logoWide: true,
  },
  {
    stat: '0 → 50K',
    statLabel: 'Takipçi Büyümesi',
    title: 'BirTvYayin',
    desc: 'Hesabı sıfırdan kurduk. 7 milyon ve 3 milyon izlenmeli viral videolarla 50.000 takipçiye ulaştırdık.',
    href: 'https://www.instagram.com/birtvyayin/',
    logo: '/images/clients/birtvyayin.jpg',
  },
  {
    stat: '0₺ Bütçe',
    statLabel: 'Organik Büyüme',
    title: 'Ballicams',
    desc: '14.000 takipçiden başladık. Hiç reklam bütçesi harcamadan organik olarak 50.000 takipçiye ulaştırdık.',
    href: 'https://www.instagram.com/ballicams/',
    logo: '/images/clients/ballicams.jpg',
  },
]

const PRODUKSIYON = [
  {
    title: 'Çok Düzgün Bir Kız',
    desc: 'Çekimini üstlendiğimiz kısa film onlarca ödül aldı.',
    href: 'https://www.instagram.com/cokduzgunbirkizkisafilm/reel/DNdoDrbs8ge/',
    embed: true,
  },
  {
    title: 'Sinematik Reklam Çekimi',
    desc: 'İzmir\'de eşi benzeri görülmemiş sinematik bir reklam filmi ortaya çıkardık.',
    href: 'https://www.instagram.com/p/DOB6FMvDORL/',
    embed: true,
  },
  {
    title: 'Perdeki Kısa Film',
    desc: 'Prodüksiyonunda yer aldığımız, ödüllü bir kısa film.',
    href: 'https://www.instagram.com/perdekisafilm/reels/',
    embed: false,
  },
]

export function SocialProof() {
  return (
    <section id="sonuclar" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">GERÇEK MÜŞTERİLER, GERÇEK SONUÇLAR</p>
          <h2 className="font-bebas text-5xl text-[#1a1a1a] tracking-wider">RAKAMLAR KONUŞUR</h2>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5 mb-16">
          {SONUCLAR.map((s, i) => (
            <a
              key={i}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#f8f9fa] rounded-2xl p-6 border border-[#eaeaea] hover:border-[#1a1a1a] hover:shadow-lg transition-all flex flex-col"
            >
              <div className="font-bebas text-4xl text-[#1a1a1a] tracking-wider mb-1">{s.stat}</div>
              <div className="text-[#999] text-xs font-montserrat font-semibold uppercase tracking-wider mb-4">{s.statLabel}</div>
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={s.logo}
                  alt={s.title}
                  className={s.logoWide ? 'h-5 w-auto object-contain' : 'w-8 h-8 rounded-full object-cover border border-[#eaeaea]'}
                />
                {!s.logoWide && <h4 className="font-montserrat font-bold text-sm text-[#1a1a1a]">{s.title}</h4>}
              </div>
              <p className="text-[#555] text-xs font-montserrat leading-relaxed flex-1">{s.desc}</p>
              <div className="flex items-center gap-1 text-[#1a1a1a] text-xs font-montserrat font-semibold mt-4 opacity-60 group-hover:opacity-100 transition-opacity">
                Profili İncele <ExternalLink size={12} />
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mb-10">
          <p className="text-[#999] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-2">SADECE REKLAM DEĞİL</p>
          <h3 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider">ÖDÜLLÜ PRODÜKSİYON İŞİMİZ</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PRODUKSIYON.map((p, i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-2xl p-6 flex flex-col">
              <span className="inline-block bg-[#ffc107] text-black text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase mb-4 w-fit">
                Ödüllü
              </span>
              <h4 className="font-bebas text-xl tracking-wider text-white mb-2">{p.title}</h4>
              <p className="text-gray-400 text-xs font-montserrat leading-relaxed mb-4">{p.desc}</p>
              {p.embed ? (
                <div className="rounded-xl overflow-hidden bg-white">
                  <InstagramEmbed url={p.href} />
                </div>
              ) : (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#ffc107] text-xs font-montserrat font-semibold opacity-70 hover:opacity-100 transition-opacity mt-auto"
                >
                  İzle <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 mt-14 opacity-70">
          <span className="text-[#999] text-xs font-montserrat uppercase tracking-wider">İş Ortağımız</span>
          <img src="/images/partners/officeizmir-logo.png" alt="Office İzmir" className="h-6 w-auto grayscale hover:grayscale-0 transition-all" />
        </div>
      </div>
    </section>
  )
}
