import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const { token } = req.nextauth

    // If no token and accessing protected routes, redirect to login
    if (!token && (pathname === '/' || pathname.startsWith('/dashboard'))) {
      console.log('No token, redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Admin-only routes
    const adminOnlyRoutes = [
      '/dashboard/settings',
      '/dashboard/staff',
    ]

    // Admin-only API routes
    const adminOnlyApiRoutes = [
      '/api/staff',
      '/api/auth/change-password',
    ]

    // Check if route requires admin access
    const isAdminOnlyRoute = adminOnlyRoutes.some(route => pathname.startsWith(route))
    const isAdminOnlyApiRoute = adminOnlyApiRoutes.some(route => pathname.startsWith(route))

    if ((isAdminOnlyRoute || isAdminOnlyApiRoute) && token?.role !== 'admin') {
      console.log('Admin required, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Edit and delete operations are admin-only
    if (pathname.includes('/edit') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (pathname.includes('/api/customers/') && req.method === 'DELETE' && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Note: PUT requests to customers API are allowed for staff to update images after customer creation

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to login page without token
        if (pathname.startsWith('/auth/login')) {
          return true
        }
        
        // Require token for root and dashboard routes
        if (pathname === '/' || pathname.startsWith('/dashboard') || pathname.startsWith('/api')) {
          return !!token
        }
        
        return true
      }
    },
  }
)

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/api/customers/:path*',
    '/api/staff/:path*',
    '/api/auth/change-password'
  ]
}
