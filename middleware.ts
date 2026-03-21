import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hostname = req.headers.get('host') || ''
  
  // Admin panel protection
  if (hostname.startsWith('admin.') || pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token && !pathname.includes('/giris')) {
      return NextResponse.redirect(new URL('/admin/giris', req.url))
    }
    if (token && (token as any).type !== 'admin' && !pathname.includes('/giris')) {
      return NextResponse.redirect(new URL('/admin/giris', req.url))
    }
  }
  
  // Teklif portal protection
  if (hostname.startsWith('teklif.') || pathname.startsWith('/kasa')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/kasa/:path*'],
}
