'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiLogin, apiRegister, apiRefreshToken, getSession } from '@/lib/auth';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,  // ← as const résout l'erreur de type
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
};

export async function loginAction(_prevState: unknown, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        const { access_token } = await apiLogin(email, password);
        (await cookies()).set('auth_token', access_token, cookieOptions);
    } catch (e: unknown) {
        return { error: e instanceof Error ? e.message : 'Erreur de connexion' };
    }

    redirect('/dashboard');
}

export async function registerAction(_prevState: unknown, formData: FormData) {
    const password = formData.get('password') as string;
    const confirm = formData.get('confirmPassword') as string;

    if (password !== confirm) {
        return { error: 'Les mots de passe ne correspondent pas' };
    }

    try {
        const { access_token } = await apiRegister({
            firstname: formData.get('firstname') as string,
            lastname: formData.get('lastname') as string,
            username: formData.get('username') as string,
            email: formData.get('email') as string,
            password,
            country: (formData.get('country') as string) ?? 'FR',
        });
        (await cookies()).set('auth_token', access_token, cookieOptions);
    } catch (e: unknown) {
        return { error: e instanceof Error ? e.message : 'Erreur inscription' };
    }

    redirect('/dashboard');
}

export async function logoutAction() {
    (await cookies()).delete('auth_token');
    redirect('/login');
}

export async function refreshTokenAction() {
    try {
        const { access_token } = await apiRefreshToken();
        if (access_token == '') return; 
        (await cookies()).set('auth_token', access_token, cookieOptions);
    } catch {
        (await cookies()).delete('auth_token');
    }
}