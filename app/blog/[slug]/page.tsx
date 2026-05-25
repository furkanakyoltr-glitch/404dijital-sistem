import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BLOG_POSTS, getBlogPost, getRelatedPosts, type Section } from '@/lib/blog-posts'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPost(params.slug)
  if (!post) return {}
  return {
    title: `${post.title} | 404 Dijital Blog`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `https://404dijital.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://404dijital.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      siteName: '404 Dijital',
    },
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  'Meta Ads': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Strateji': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Rehber': 'bg-green-500/10 text-green-400 border-green-500/20',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function RenderSection({ section }: { section: Section }) {
  switch (section.type) {
    case 'h2':
      return (
        <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider mt-10 mb-4">
          {section.content}
        </h2>
      )
    case 'h3':
      return (
        <h3 className="font-bebas text-xl text-[#1a1a1a] tracking-wider mt-6 mb-3">
          {section.content}
        </h3>
      )
    case 'p':
      return (
        <p className="text-[#444] font-montserrat text-base leading-relaxed mb-4">
          {section.content}
        </p>
      )
    case 'ul':
      return (
        <ul className="mb-6 space-y-2">
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[#444] font-montserrat text-sm leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#ffc107] flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol className="mb-6 space-y-3">
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-4 text-[#444] font-montserrat text-sm leading-relaxed">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-xs font-bold font-montserrat">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      )
    case 'tip':
      return (
        <div className="my-6 bg-[#ffc107]/10 border-l-4 border-[#ffc107] rounded-r-xl p-5">
          <p className="text-[#1a1a1a] font-montserrat text-sm font-semibold leading-relaxed">
            💡 {section.content}
          </p>
        </div>
      )
    case 'table':
      return (
        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm font-montserrat">
            <thead>
              <tr className="bg-[#1a1a1a]">
                {section.headers?.map((h, i) => (
                  <th key={i} className="text-left text-white px-4 py-3 font-semibold text-xs tracking-wider uppercase first:rounded-tl-lg last:rounded-tr-lg">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows?.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-[#444] border-b border-[#eaeaea]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'cta_inline':
      return (
        <div className="my-8 bg-[#1a1a1a] rounded-2xl p-8 text-center">
          <p className="text-white font-montserrat font-semibold text-base mb-4">
            {section.content}
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 bg-[#ffc107] text-[#1a1a1a] font-montserrat font-extrabold px-6 py-3 rounded-full hover:bg-[#ffca2c] transition-colors text-sm"
          >
            ÜCRETSİZ ANALİZ İSTE
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      )
    default:
      return null
  }
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug)
  if (!post) notFound()

  const related = getRelatedPosts(post.slug, 2)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: '404 Dijital' },
    publisher: {
      '@type': 'Organization',
      name: '404 Dijital',
      logo: { '@type': 'ImageObject', url: 'https://404dijital.com/images/og-image.jpg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://404dijital.com/blog/${post.slug}` },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="bg-white">

        {/* Article header */}
        <section className="bg-[#1a1a1a] pt-24 pb-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/blog" className="text-gray-500 hover:text-white font-montserrat text-sm transition-colors">
                ← Blog
              </Link>
              <span className="text-gray-600">/</span>
              <span className={`text-xs font-montserrat font-bold px-3 py-1 rounded-full border ${CATEGORY_COLORS[post.category] ?? 'bg-white/10 text-white border-white/20'}`}>
                {post.category}
              </span>
            </div>
            <h1 className="font-bebas text-4xl md:text-5xl text-white tracking-wider leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-500 font-montserrat text-sm">
              <span>404 Dijital</span>
              <span>·</span>
              <span>{formatDate(post.date)}</span>
              <span>·</span>
              <span>{post.readTime} okuma</span>
            </div>
          </div>
        </section>

        {/* Article body */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {post.sections.map((section, i) => (
            <RenderSection key={i} section={section} />
          ))}
        </article>

        {/* Final CTA */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-[#f8f9fa] rounded-3xl p-10 border border-[#eaeaea] text-center">
            <p className="text-[#ffc107] font-montserrat font-semibold text-xs tracking-[3px] uppercase mb-3">404 DİJİTAL</p>
            <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider mb-3">
              SIZI BÜYÜTMEK İSTİYORUZ
            </h2>
            <p className="text-[#555] font-montserrat text-sm mb-6 max-w-md mx-auto">
              Bu yazıda öğrendiklerinizi işletmenize uygulamak için uzman desteğe ihtiyaç duyarsanız, ücretsiz analiz randevusu alın.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white font-montserrat font-extrabold px-6 py-3 rounded-full hover:bg-[#333] transition-colors text-sm"
              >
                ÜCRETSİZ ANALİZ İSTE
              </Link>
              <a
                href="https://wa.me/905446844067?text=Merhaba, blog yazısını okudum, analiz istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-montserrat font-bold px-6 py-3 rounded-full hover:bg-[#1ea952] transition-colors text-sm"
              >
                WHATSAPP
              </a>
            </div>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <h2 className="font-bebas text-2xl text-[#1a1a1a] tracking-wider mb-6">İLGİLİ YAZILAR</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="group block bg-[#f8f9fa] rounded-2xl p-6 border border-[#eaeaea] hover:border-[#1a1a1a] transition-all">
                  <span className={`text-xs font-montserrat font-bold px-2 py-1 rounded-full border ${CATEGORY_COLORS[r.category] ?? ''} mb-3 inline-block`}>
                    {r.category}
                  </span>
                  <h3 className="font-bebas text-lg text-[#1a1a1a] tracking-wider leading-tight group-hover:text-[#ffc107] transition-colors">
                    {r.title}
                  </h3>
                  <p className="text-[#999] font-montserrat text-xs mt-2">{r.readTime} okuma</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
