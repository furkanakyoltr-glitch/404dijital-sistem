import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hostname = req.headers.get('x-forwarded-host') || req.headers.get('host') || ''

  // admin.404dijital.com → Worker zaten /admin/* path'e yönlendiriyor
  // Burada sadece auth kontrolü yap
  if (hostname.startsWith('admin.')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token && !pathname.includes('/giris')) {
      return NextResponse.redirect(new URL('/admin/giris', req.url))
    }
    if (token && (token as any).type !== 'admin' && !pathname.includes('/giris')) {
      return NextResponse.redirect(new URL('/admin/giris', req.url))
    }
    return NextResponse.next()
  }

  // teklif.404dijital.com → Worker zaten /kasa/* path'e yönlendiriyor
  // Kasa sayfaları public — müşteriler direkt kasaNo linki ile giriyor
  if (hostname.startsWith('teklif.')) {
    return NextResponse.next()
  }

  // Normal /admin/* koruması (404dijital.com üzerinden erişim)
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token && !pathname.includes('/giris')) {
      return NextResponse.redirect(new URL('/admin/giris', req.url))
    }
    if (token && (token as any).type !== 'admin' && !pathname.includes('/giris')) {
      return NextResponse.redirect(new URL('/admin/giris', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
