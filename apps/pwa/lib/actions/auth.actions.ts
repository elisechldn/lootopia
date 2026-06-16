'use server';

import { API_URL } from '@/lib/api';
import { registerPlayer } from '@/services/auth.service';
import { type UserInfos } from '@/store/userStore';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import { handleUnauthorized } from './utils';

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

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? 'Email ou mot de passe incorrect');
  }

  const json = await res.json();
  const { access_token, user } = json.data as { access_token: string; user: UserInfos };

  // Cloisonnement : la PWA est réservée aux PLAYER et ADMIN.
  if (user.role !== 'PLAYER' && user.role !== 'ADMIN') {
    throw new Error('Ce compte partenaire doit utiliser le portail web.');
  }

  (await cookies()).set('auth_token', access_token, COOKIE_OPTIONS);

  return { user };
}

export async function forgotPasswordAction(email: string): Promise<void> {
  await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  // Silencieux : anti-énumération, pas de throw
}

export async function resetPasswordAction(token: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) throw new Error('Token invalide ou expiré');
}

export async function verifyEmailAction(token: string): Promise<{ user: UserInfos }> {
  const res = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? 'Lien invalide ou expiré');
  }
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

export async function getMeAction(): Promise<UserInfos | null> {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      await handleUnauthorized(res);
      (await cookies()).delete('auth_token');
      return null;
    }
    const json = await res.json();
    return (json.data ?? json) as UserInfos;
  } catch {
    return null;
  }
}

export async function registerAction(formData: FormData) {
  "use server";

  const firstname = String(formData.get("firstname") ?? "");
  const lastname = String(formData.get("lastname") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password !== confirmPassword) {
    redirect(`/register?error=${encodeURIComponent("Les mots de passe ne correspondent pas")}`);
  }

  try {
    await registerPlayer({ firstname, lastname, email, password });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors de l'inscription";
    redirect(`/register?error=${encodeURIComponent(message)}`);
  }

  redirect("/register/confirm");
}