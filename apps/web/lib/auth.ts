import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:8000';

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
    console.log("API_URL --> ", API_URL)
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Identifiants invalides');
    const json = await res.json();
    return json.data as { access_token: string; user: { role: string } };
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
    return json.data as { access_token: string; user: { role: string } };
}