'use server';

import { cookies } from 'next/headers';
import { API_URL } from '@/lib/api';
import { type UserInfos } from '@/store/userStore';

export async function getMyParticipationsAction(): Promise<UserInfos['participations']> {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return [];

  const res = await fetch(`${API_URL}/participations/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];

  const json = await res.json();
  return (json.data ?? json) as UserInfos['participations'];
}
