import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register'];

function isDesktop(userAgent: string): boolean {
  return !/android|iphone|ipad|ipod|mobile|tablet/i.test(userAgent);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block desktop browsers — allow /not-mobile through (already excluded in matcher)
  const ua = request.headers.get('user-agent') ?? '';
  if (isDesktop(ua)) {
    return NextResponse.redirect(new URL('/not-mobile', request.url));
  }

  const token = request.cookies.get('auth_token')?.value;
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|not-mobile|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
  ],
};
