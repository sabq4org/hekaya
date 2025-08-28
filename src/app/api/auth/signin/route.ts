import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Simple check for demo purposes
    if (email === 'admin@hekaya-ai.com' && password === 'admin123') {
      // Create response with redirect using 303 status to ensure GET request
      const response = NextResponse.redirect(new URL('/admin', request.url), 303)
      
      // Set cookie before redirect
      response.cookies.set('auth-token', 'demo-token', {
        httpOnly: true,
        secure: false, // Set to false for development
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
      
      return response
    }

    return NextResponse.redirect(new URL('/admin/login?error=invalid', request.url))
  } catch (error) {
    return NextResponse.redirect(new URL('/admin/login?error=error', request.url))
  }
}