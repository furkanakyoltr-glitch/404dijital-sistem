import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/kasa/', '/api/'],
    },
    sitemap: 'https://404dijital.com/sitemap.xml',
  }
}
