import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user is trying to access admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page without authentication
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check for either our simple demo token OR NextAuth secure session token
    const demoAuthToken = request.cookies.get('auth-token')
    const nextAuthToken =
      request.cookies.get('__Secure-next-auth.session-token') ||
      request.cookies.get('next-auth.session-token')

    if (!demoAuthToken && !nextAuthToken) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}