import NextAuth from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse, userAgent } from 'next/server';
import authConfig from './lib/auth.config';
import { logError } from './lib/errors';
import { URL_LEGAL_MENTIONS, URL_PRIVACY } from './shared/route';

const { auth } = NextAuth(authConfig);
export default auth(async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;
  const { device } = userAgent(req);
  const viewport = device.type || 'desktop';

  url.searchParams.set('viewport', viewport);

  // Allow public routes
  if (path === '/' || path === URL_PRIVACY || path === URL_LEGAL_MENTIONS) {
    return NextResponse.next();
  }

  // Allow auth API routes
  if (path.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    logError({}, 'NEXTAUTH_SECRET Error');
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    const session = await getToken({
      req,
      secret,
      salt:
        process.env.NODE_ENV === 'production'
          ? '__Secure-authjs.session-token'
          : 'authjs.session-token',
      cookieName:
        process.env.NODE_ENV === 'production'
          ? '__Secure-authjs.session-token'
          : 'authjs.session-token',
      secureCookie: process.env.NODE_ENV === 'production',
    });

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-url', req.url);
    requestHeaders.set('x-pathname', path);
    requestHeaders.set('x-viewport', viewport);
    if (!session) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Check if token has error (refresh token expired)
    if (session.error === 'RefreshTokenError') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Create response with security headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Add security headers for iframe protection
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Specific CSP for pages with iframes
    // if (path.includes('/movies/') || path.includes('/dashboard/')) {
    //   response.headers.set(
    //     'Content-Security-Policy',
    //     [
    //       "default-src 'self'",
    //       "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://apis.google.com https://accounts.google.com",
    //       "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    //       "font-src 'self' https://fonts.gstatic.com",
    //       "img-src 'self' data: https: blob:",
    //       "media-src 'self' https://drive.google.com https://www.youtube.com blob:",
    //       "connect-src 'self' https://api.themoviedb.org https://accounts.google.com https://www.googleapis.com",
    //       "frame-src 'self' https://drive.google.com https://www.youtube.com https://accounts.google.com",
    //       "object-src 'none'",
    //       "base-uri 'self'",
    //       "form-action 'self'",
    //     ].join('; ')
    //   );
    // }

    return NextResponse.rewrite(url);
  } catch (error) {
    logError(error, 'Middleware error');
    return NextResponse.redirect(new URL('/', req.url));
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - except auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
