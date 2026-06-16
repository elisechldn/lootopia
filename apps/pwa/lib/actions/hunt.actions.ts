'use server';

import { cookies } from 'next/headers';
import type { SingleResult } from '@repo/types';
import { API_URL } from '@/lib/api';
import { type HuntWithSteps } from '@/services/hunt.service';
import { handleUnauthorized } from './utils';

/**
 * Récupère le détail d'une chasse en transmettant le token d'authentification
 * (cookie httpOnly, illisible côté client → server action obligatoire).
 * L'API renvoie un payload réduit pour les joueurs (sans indices ni rewardValue).
 */
export async function getHuntByIdAction(
  id: number,
): Promise<SingleResult<HuntWithSteps>> {
  const token = (await cookies()).get('auth_token')?.value;
  const res = await fetch(`${API_URL}/hunts/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });
  if (!res.ok) {
    await handleUnauthorized(res);
    throw new Error('No Hunt found');
  }
  const data = await res.json();
  return data as Promise<SingleResult<HuntWithSteps>>;
}
