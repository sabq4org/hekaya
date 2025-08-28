import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Check if user is trying to access admin routes
    if (req.nextUrl.pathname.startsWith("/admin") && 
        req.nextUrl.pathname !== "/admin/login") {
      
      const token = req.nextauth.token
      
      // If no token, redirect to login
      if (!token) {
        return NextResponse.redirect(new URL("/admin/login", req.url))
      }
      
      // Check if user has admin or editor role
      if (token.role !== "ADMIN" && token.role !== "EDITOR") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without token
        if (req.nextUrl.pathname === "/admin/login") {
          return true
        }
        
        // For admin routes, require token
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token
        }
        
        // Allow all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*"]
}

