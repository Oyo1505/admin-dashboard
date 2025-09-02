import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { URL_LEGAL_MENTIONS, URL_PRIVACY } from './shared/route';
import NextAuth from 'next-auth';
import authConfig from './lib/auth.config';

const { auth } = NextAuth(authConfig);
export default auth(async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

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
    console.error('NEXTAUTH_SECRET is not defined');
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

    if (!session) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Check if token has error (refresh token expired)
    if (session.error === 'RefreshTokenError') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
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
