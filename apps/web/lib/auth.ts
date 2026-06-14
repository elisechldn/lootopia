import { cookies } from 'next/headers';
import { API_URL } from '@/lib/api';

export async function getSession() {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return null;
    try {
        // Décode sans vérifier (la vérif se fait côté API)
        const payload = JSON.parse(atob(token.split('.')[1]!));
        return payload as { sub: number; email: string; role: string };
    } catch {
        return null;
    }
}

export async function apiLogin(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Identifiants invalides');
    const json = await res.json();
    return json.data as { access_token: string; user: { id: number; email: string; role: string; firstname: string; lastname: string } };
}

export async function apiVerifyEmail(token: string) {
    const res = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? 'Lien invalide ou expiré');
    }
    const json = await res.json();
    return json.data as { access_token: string; user: { id: number; email: string; role: string; firstname: string; lastname: string } };
}

export async function apiForgotPassword(email: string) {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Erreur lors de la demande');
}

export async function apiResetPassword(token: string, password: string) {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
    });
    if (!res.ok) throw new Error('Token invalide ou expiré');
}

export async function apiRegister(data: {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    country: string;
}) {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur inscription');
    }
    const json = await res.json();
    return json.data as { message: string };
}