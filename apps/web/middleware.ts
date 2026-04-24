import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register');

    if (!token && !isAuthPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    try {
        // 3. Logique de rafraîchissement
        const session = await getSession();
        if (!session) {
            // Pas de session valide, on nettoie et redirige
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth_token');
            return response;
        }
        const isExpired = Date.now() >= session.exp * 1000; 

        if (isExpired) {
            const resRefresh = await fetch(`${process.env.API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.sub }),
            });

            if (resRefresh.ok) {
                const { data } = await resRefresh.json();
                const newToken = data.access_token;

                const response = NextResponse.next();

                response.cookies.set('auth_token', newToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                });

                return response;
            } else {
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete('auth_token');
                return response;
            }
        }
    } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/(partner)/:path*', '/dashboard/:path*', '/login', '/register'],
};