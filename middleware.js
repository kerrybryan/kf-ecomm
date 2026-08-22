import { NextResponse } from 'next/server';

const ADMIN_ROLES = ['super_admin', 'product_manager', 'sales_manager', 'support', 'admin'];

/**
 * Lightweight JWT payload decoder safe for Edge runtime
 */
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only apply to /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('nordika_auth_token')?.value;
    const payload = token ? decodeJwtPayload(token) : null;
    const isTokenValid = payload && payload.userId && (!payload.exp || payload.exp * 1000 > Date.now());
    const isAdmin = isTokenValid && ADMIN_ROLES.includes(payload.role);

    // Case 1: Already logged in as admin visiting /admin/login -> redirect to /admin dashboard
    if (pathname === '/admin/login') {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Case 2: Visiting protected admin route without valid admin role -> redirect to /admin/login
    if (!isAdmin) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
