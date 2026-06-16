'use server';

import { cookies } from 'next/headers';
import { API_URL } from '@/lib/api';
import { handleUnauthorized } from './utils';

export async function uploadAvatarAction(formData: FormData): Promise<{ url: string }> {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) throw new Error('Non authentifié');

  const res = await fetch(`${API_URL}/users/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    await handleUnauthorized(res);
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? "Échec de l'upload de l'avatar");
  }

  const json = await res.json();
  return { url: json.data?.url ?? json.url };
}
