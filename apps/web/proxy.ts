import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rôles autorisés sur le portail web : partenaires et admins. Un PLAYER doit utiliser la PWA.
const ALLOWED_ROLES = ['PARTNER', 'ADMIN'];

// Décodage optimiste du rôle (sans vérif de signature) : suffisant pour le routing,
// l'API reste la source de vérité pour l'accès aux données.
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
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;
    const isAuthPage =
        pathname.startsWith('/login') || pathname.startsWith('/register');

    if (!token && !isAuthPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Mauvais rôle pour cette app (ex. PLAYER) : on déconnecte et on renvoie au login.
    if (token && !isAuthPage && !ALLOWED_ROLES.includes(decodeRole(token) ?? '')) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
    }

    if (token && isAuthPage) {
        if (ALLOWED_ROLES.includes(decodeRole(token) ?? '')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        // Token d'un mauvais rôle traînant sur une page d'auth : on le purge.
        const response = NextResponse.next();
        response.cookies.delete('auth_token');
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
};
