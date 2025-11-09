import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const isAppSubdomain = hostname.startsWith('app.') || hostname === 'app.relicon.co';
  const isMainDomain = hostname === 'relicon.co' || hostname.includes('railway.app');

  // Handle app subdomain routing
  if (isAppSubdomain) {
    // Redirect root to login
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Only allow app routes on app subdomain
    const allowedPaths = ['/login', '/dashboard', '/api', '/_next', '/favicon'];
    const isAllowed = allowedPaths.some(path => request.nextUrl.pathname.startsWith(path));
    
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } 
  
  // Handle main domain routing
  if (isMainDomain) {
    // Redirect app routes to app subdomain
    if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL(`https://app.relicon.co${request.nextUrl.pathname}`));
    }
  }

  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://eabligzfnqowxdkwavbd.supabase.co wss://eabligzfnqowxdkwavbd.supabase.co https://relicon-full-production-35cc.up.railway.app",
      "media-src 'self' blob: https:",
      "object-src 'self' data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  );

  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
