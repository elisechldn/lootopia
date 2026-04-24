import {
  type HuntGetPayload,
  HuntModel,
  PaginatedResult,
  SingleResult,
} from '@repo/types';

import { API_URL } from '@/lib/api';

type HuntWithSteps = HuntGetPayload<{
  include: { steps: true };
}>;

export type NearbyHunt = {
  id: number;
  title: string;
  shortDescription: string | null;
  rewardType: string | null;
  rewardValue: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  latitude: number | null;
  longitude: number | null;
  distance: number; // mètres, calculé par PostGIS
};

export async function getAllHunts() {
  const response = await fetch(`${API_URL}/hunts`);
  if (!response.ok) throw new Error('No Hunt found');
  return response.json() as Promise<PaginatedResult<HuntModel>>;
}

export async function getHuntById(id: number) {
  const response = await fetch(`${API_URL}/hunts/${id}`);
  if (!response.ok) throw new Error('No Hunt found');
  return response.json() as Promise<SingleResult<HuntWithSteps>>;
}

export async function getNearbyHunts(
  lat: number,
  lon: number,
  radius?: number,
): Promise<NearbyHunt[]> {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
  if (radius) params.set('radius', String(radius));
  const response = await fetch(
    `${API_URL}/hunts/nearby?${params}`,
  );
  if (!response.ok) return [];
  const result = await response.json();
  // Le TransformInterceptor NestJS enveloppe dans { data: [...] }
  return (result.data ?? result) as NearbyHunt[];
}
