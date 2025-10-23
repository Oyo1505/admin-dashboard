import { headers } from 'next/headers';
import { NextRequest, NextResponse, userAgent } from 'next/server';
import { auth } from './lib/auth';
import { logError } from './lib/errors';
import { URL_BASE, URL_LEGAL_MENTIONS, URL_PRIVACY } from './shared/route';

export default async function middleware(req: NextRequest) {
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

  // Bypass authentication in test mode
  const isTestMode = process.env.PLAYWRIGHT_TEST_MODE === 'true';

  try {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-url', req.url);
    requestHeaders.set('x-pathname', path);
    requestHeaders.set('x-viewport', viewport);

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

    // Skip session check in test mode
    if (!isTestMode) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) {
        return NextResponse.redirect(new URL(URL_BASE, req.url));
      }
    }
    return NextResponse.rewrite(url);
  } catch (error) {
    logError(error, 'Middleware error');
    return NextResponse.redirect(new URL('/', req.url));
  }
}

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
  runtime: 'nodejs',
};
