import { NextRequest, NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import { URL_HOME } from '@/shared/route';
export { auth as middleware } from '@/lib/auth';

export default async function middleware(req: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = req.nextUrl.pathname;

  // If it's the root path, just render it
  if (path === "/") {
    return NextResponse.next();
  }

  const session = await getToken({
    req,
    //@ts-ignore
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  if (!session && path === "/protected") {
    return NextResponse.redirect(new URL("/", req.url));
  } else if (session) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
