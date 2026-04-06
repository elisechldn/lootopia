'use server';

import { cookies } from 'next/headers';
import { type UserInfos } from '@/store/userStore';

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 jours
  path: '/',
};

export async function loginAction(email: string, password: string,): Promise<{ user: UserInfos }> {

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error('Email ou mot de passe incorrect');

  const json = await res.json();
  const { access_token, user } = json.data as { access_token: string; user: UserInfos };

  (await cookies()).set('auth_token', access_token, COOKIE_OPTIONS);

  return { user };
}

export async function logoutAction() {
  (await cookies()).delete('auth_token');
}

export async function getAuthToken(): Promise<string | null> {
  return (await cookies()).get('auth_token')?.value ?? null;
}
