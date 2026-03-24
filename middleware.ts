import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hostname = req.headers.get('host') || ''

  // admin.404dijital.com → /admin/* path'e yönlendir
  if (hostname.startsWith('admin.')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    // /admin prefix olmayan path'leri rewrite et
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
      const newPath = pathname === '/' ? '/admin' : `/admin${pathname}`
      return NextResponse.rewrite(new URL(newPath, req.url))
    }
    // Auth kontrolü
    if (!token && !pathname.includes('/giris')) {
      return NextResponse.redirect(new URL('/admin/giris', req.url))
    }
    if (token && (token as any).type !== 'admin' && !pathname.includes('/giris')) {
      return NextResponse.redirect(new URL('/admin/giris', req.url))
    }
    return NextResponse.next()
  }

  // teklif.404dijital.com → /kasa/* path'e yönlendir
  if (hostname.startsWith('teklif.')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!pathname.startsWith('/kasa') && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      const newPath = pathname === '/' ? '/kasa' : `/kasa${pathname}`
      return NextResponse.rewrite(new URL(newPath, req.url))
    }
    if (!token && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // Normal /admin/* ve /kasa/* koruması (404dijital.com üzerinden erişim)
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token && !pathname.includes('/giris')) {
      return NextResponse.redirect(new URL('/admin/giris', req.url))
    }
    if (token && (token as any).type !== 'admin' && !pathname.includes('/giris')) {
      return NextResponse.redirect(new URL('/admin/giris', req.url))
    }
  }

  if (pathname.startsWith('/kasa')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
