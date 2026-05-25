import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BLOG_POSTS } from '@/lib/blog-posts'

export const metadata: Metadata = {
  title: 'Blog | 404 Dijital — Dijital Pazarlama Rehberleri',
  description: 'Meta Ads, Google Ads, ROAS, kitle hedefleme ve dijital pazarlama stratejileri hakkında güncel rehberler. İşletmenizi büyütecek bilgiler 404 Dijital blogunda.',
  keywords: ['dijital pazarlama blog', 'meta ads rehber', 'reklam ajansı blog', 'instagram reklam ipuçları'],
  alternates: { canonical: 'https://404dijital.com/blog' },
  openGraph: {
    title: 'Blog | 404 Dijital',
    description: 'Dijital pazarlama, Meta Ads ve büyüme stratejileri hakkında güncel rehberler.',
    url: 'https://404dijital.com/blog',
    siteName: '404 Dijital',
    type: 'website',
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  'Meta Ads': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Strateji': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Rehber': 'bg-green-500/10 text-green-400 border-green-500/20',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS

  return (
    <>
      <Header />
      <main className="bg-white min-h-screen">

        {/* Hero */}
        <section className="bg-[#1a1a1a] pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-[#ffc107] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-4">
              BLOG
            </p>
            <h1 className="font-bebas text-6xl md:text-8xl text-white tracking-wider mb-6">
              DİJİTAL PAZARLAMA<br />REHBERLERİ
            </h1>
            <p className="text-gray-400 font-montserrat text-lg max-w-2xl">
              Meta Ads, Google Ads, ROAS hesaplama ve büyüme stratejileri. İşletmenizi büyütecek bilgiler.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Featured post */}
          <div className="mb-16">
            <Link href={`/blog/${featured.slug}`} className="group block bg-[#f8f9fa] rounded-3xl overflow-hidden border border-[#eaeaea] hover:border-[#1a1a1a] transition-all hover:shadow-xl">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="bg-[#1a1a1a] flex items-center justify-center p-16 min-h-[280px]">
                  <div className="text-center">
                    <span className={`inline-block text-xs font-montserrat font-bold px-3 py-1 rounded-full border mb-4 ${CATEGORY_COLORS[featured.category] ?? 'bg-white/10 text-white border-white/20'}`}>
                      {featured.category}
                    </span>
                    <div className="font-bebas text-5xl text-white tracking-wider leading-tight">
                      ÖNE ÇIKAN<br />YAZI
                    </div>
                  </div>
                </div>
                <div className="p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4 text-xs text-[#999] font-montserrat">
                    <span>{formatDate(featured.date)}</span>
                    <span>·</span>
                    <span>{featured.readTime} okuma</span>
                  </div>
                  <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider mb-4 leading-tight group-hover:text-[#ffc107] transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-[#555] font-montserrat text-sm leading-relaxed mb-6">
                    {featured.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-2 text-[#1a1a1a] font-montserrat font-bold text-sm group-hover:gap-4 transition-all">
                    Devamını Oku
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Post grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block bg-white rounded-2xl border border-[#eaeaea] hover:border-[#1a1a1a] transition-all hover:shadow-lg overflow-hidden">
                <div className="bg-[#1a1a1a] p-8 flex items-center justify-center min-h-[140px]">
                  <span className={`text-xs font-montserrat font-bold px-3 py-1.5 rounded-full border ${CATEGORY_COLORS[post.category] ?? 'bg-white/10 text-white border-white/20'}`}>
                    {post.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3 text-xs text-[#aaa] font-montserrat">
                    <span>{formatDate(post.date)}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="font-bebas text-xl text-[#1a1a1a] tracking-wider mb-3 leading-tight group-hover:text-[#ffc107] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-[#666] font-montserrat text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-[#1a1a1a] font-montserrat font-bold text-xs group-hover:gap-2 transition-all">
                    Oku
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA banner */}
          <div className="mt-16 bg-[#1a1a1a] rounded-3xl p-10 text-center">
            <p className="text-[#ffc107] font-montserrat font-semibold text-sm tracking-[3px] uppercase mb-3">HAZIR MISINIZ?</p>
            <h2 className="font-bebas text-4xl md:text-5xl text-white tracking-wider mb-4">
              ÜCRETSİZ ANALİZ ALIN
            </h2>
            <p className="text-gray-400 font-montserrat text-base mb-8 max-w-xl mx-auto">
              Reklam bütçenizi boşa harcamayın. Mevcut durumunuzu analiz edip size özel strateji hazırlayalım.
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 bg-[#ffc107] text-[#1a1a1a] font-montserrat font-extrabold px-8 py-4 rounded-full hover:bg-[#ffca2c] transition-colors"
            >
              HEMEN BAŞLAYIN
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
