'use server';

import { cookies } from 'next/headers';
import { API_URL } from '@/lib/api';
import { type UserInfos } from '@/store/userStore';
import {
  type GameParticipation,
  type LeaderboardEntry,
} from '@/services/participation.service';

function unwrap(body: unknown) {
  return (body as { data?: unknown })?.data ?? body;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = (await cookies()).get('auth_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getParticipationByIdAction(
  participationId: number,
): Promise<GameParticipation> {
  const res = await fetch(`${API_URL}/participations/${participationId}`, {
    headers: await authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Participation introuvable');
  return unwrap(await res.json()) as GameParticipation;
}

export async function startHuntAction(huntId: number): Promise<GameParticipation> {
  const res = await fetch(`${API_URL}/participations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify({ huntId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string })?.message ?? 'Impossible de démarrer la chasse');
  }
  return unwrap(await res.json()) as GameParticipation;
}

export async function validateStepAction(
  participationId: number,
  stepId: number,
  lat: number,
  lon: number,
) {
  const res = await fetch(`${API_URL}/participations/${participationId}/steps/${stepId}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify({ latitude: lat, longitude: lon }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string })?.message ?? 'Validation échouée');
  }
  return unwrap(await res.json());
}

export async function getLeaderboardAction(huntId: number): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_URL}/participations/hunt/${huntId}/leaderboard`, {
    headers: await authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return unwrap(await res.json()) as LeaderboardEntry[];
}

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
  // L'API masque la récompense (rewardValue null) quand la chasse est terminée
  // à 0 point : pas de récompense à révéler.
  if (!match.hunt.rewardValue) return null;

  return { rewardType: match.hunt.rewardType, rewardValue: match.hunt.rewardValue };
}
