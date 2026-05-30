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

type ParticipationWithReward = {
  status: string;
  refHunt: number;
  hunt: { rewardType: string | null; rewardValue: string | null };
};

export async function getHuntRewardAction(huntId: number): Promise<{
  rewardType: string | null;
  rewardValue: string | null;
} | null> {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return null;

  const res = await fetch(`${API_URL}/participations/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;

  const json = await res.json();
  const participations = (json.data ?? json) as ParticipationWithReward[];
  const match = participations.find(
    (p) => p.refHunt === huntId && p.status === 'COMPLETED',
  );
  if (!match) return null;

  return { rewardType: match.hunt.rewardType, rewardValue: match.hunt.rewardValue };
}
