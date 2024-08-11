import { NextRequest, NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = req.nextUrl.pathname;
  // const headers = new Headers(req.headers);
  // headers.set("x-current-path",path);
  // If it's the root path, just render it
  if (path === "/") {
    return NextResponse.next();
  }
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    return 
  }
  const session = await getToken({
    req,
    secret,
    salt: process.env.NEXTAUTH_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token',
    cookieName: process.env.NEXTAUTH_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token',
    secureCookie: true,
  });

  if (!session) {
    
    return NextResponse.redirect(new URL("/", req.url));
  } 
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
