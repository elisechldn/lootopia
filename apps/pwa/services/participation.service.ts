import { API_URL } from '@/lib/api';

export type GameProgress = {
  id: number;
  statut: 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  refStep: number;
  totalPoints: number;
  completedAt: string | null;
};

export type GameParticipation = {
  id: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  totalPoints: number;
  progresses: GameProgress[];
};

function unwrap(res: Response, body: unknown) {
  return (body as { data?: unknown })?.data ?? body;
}

export async function getParticipationById(participationId: number): Promise<GameParticipation> {
  const res = await fetch(`${API_URL}/participations/${participationId}`);
  if (!res.ok) throw new Error('Participation introuvable');
  const data = await res.json();
  console.log("DATA PARTICIPATION -> ", data);
  return unwrap(res, data) as GameParticipation;
}

export async function startHunt(userId: number, huntId: number): Promise<GameParticipation> {
  const res = await fetch(`${API_URL}/participations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, huntId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string })?.message ?? 'Impossible de démarrer la chasse');
  }
  return unwrap(res, await res.json()) as GameParticipation;
}

export async function validateStep(participationId: number, stepId: number, userId: number, lat: number, lon: number) {
  const res = await fetch(`${API_URL}/participations/${participationId}/steps/${stepId}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, latitude: lat, longitude: lon }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string })?.message ?? 'Validation échouée');
  }
  return unwrap(res, await res.json());
}

export async function requestClue(participationId: number, stepId: number, clueId: number, userId: number,) {
  const res = await fetch(`${API_URL}/participations/${participationId}/steps/${stepId}/clues/${clueId}/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Impossible d\'utiliser cet indice');
  return unwrap(res, await res.json()) as { clue: string; alreadyUsed: boolean; penaltyCost?: number };
}

export async function getMyParticipations(userId: number) {
  const res = await fetch(`${API_URL}/participations/me?userId=${userId}`);
  if (!res.ok) return [];
  return unwrap(res, await res.json()) as unknown[];
}

export async function getLeaderboard(huntId: number) {
  const res = await fetch(`${API_URL}/participations/hunt/${huntId}/leaderboard`);
  if (!res.ok) return [];
  return unwrap(res, await res.json()) as unknown[];
}
