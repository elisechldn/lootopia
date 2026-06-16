'use server';

import { cookies } from 'next/headers';
import { handleUnauthorized } from './utils';

const INTERNAL_API = process.env.API_URL ?? 'http://localhost:8000';

export interface NextClueInfo {
  id: number;
  orderNumber: number;
  penaltyCost: number;
}

export interface RevealedClueInfo {
  id: number;
  orderNumber: number;
  message: string;
  penaltyCost: number;
}

export interface CluePlayerData {
  totalClues: number;
  revealedCount: number;
  nextClue: NextClueInfo | null;
  revealedClues: RevealedClueInfo[];
}

export interface RevealResult {
  clue: {
    id: number;
    message: string;
    penaltyCost: number;
    orderNumber: number;
  };
  isLastClue: boolean;
  alreadyRevealed: boolean;
}

export async function getProgressCluesAction(
  progressId: number,
): Promise<CluePlayerData> {
  const token = (await cookies()).get('auth_token')?.value;
  const res = await fetch(`${INTERNAL_API}/progress/${progressId}/clues`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });
  if (!res.ok) {
    await handleUnauthorized(res);
    throw new Error('Impossible de charger les indices');
  }
  const json = (await res.json()) as { data: CluePlayerData };
  return json.data;
}

export async function revealClueAction(
  progressId: number,
  clueId: number,
): Promise<RevealResult> {
  const token = (await cookies()).get('auth_token')?.value;
  const res = await fetch(
    `${INTERNAL_API}/progress/${progressId}/clues/${clueId}/reveal`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    },
  );
  if (!res.ok) {
    await handleUnauthorized(res);
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? 'Révélation échouée');
  }
  const json = (await res.json()) as { data: RevealResult };
  return json.data;
}
