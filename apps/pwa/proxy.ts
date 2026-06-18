import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
const ALLOWED_ROLES = ['PLAYER', 'ADMIN'];

function decodeRole(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const claims = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    return typeof claims?.role === 'string' ? claims.role : null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Mauvais rôle pour cette app (ex. PARTNER) : on déconnecte et on renvoie au login.
  if (token && !ALLOWED_ROLES.includes(decodeRole(token) ?? '')) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|manifest.webmanifest|not-mobile|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|patt|dat)$).*)',
  ],
};
