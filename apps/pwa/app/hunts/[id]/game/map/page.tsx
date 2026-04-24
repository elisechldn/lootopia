'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Navigation, Trophy, Loader2 } from 'lucide-react';
import { getHuntById } from '@/services/hunt.service';
import { getParticipationById, type GameParticipation } from '@/services/participation.service';
import { haversineDistance, formatDistance } from '@/lib/geo';
import type { HuntGetPayload } from '@repo/types';

const GameLeafletMap = dynamic(() => import('@/components/game/GameLeafletMap'), { ssr: false });

type StepWithCoords = HuntGetPayload<{ include: { steps: true } }>['steps'][number] & {
  latitude: number | null;
  longitude: number | null;
};

type HuntWithSteps = HuntGetPayload<{ include: { steps: true } }> & {
  steps: StepWithCoords[];
};

type Props = { params: Promise<{ id: string }> };

export default function GameMapPage({ params }: Props) {
  const { id: huntId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const participationId = searchParams.get('participationId');

  const [hunt, setHunt] = useState<HuntWithSteps | null>(null);
  const [participation, setParticipation] = useState<GameParticipation | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [inZone, setInZone] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch hunt + participation
  useEffect(() => {
    if (!participationId) return;
    Promise.all([
      getHuntById(+huntId),
      getParticipationById(+participationId),
    ]).then(([huntRes, participationRes]) => {
      setHunt(huntRes.data as HuntWithSteps);
      setParticipation(participationRes);
      setLoading(false);
    });
  }, [huntId, participationId]);

  // Continuous GPS watch
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 2000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Current step: the one whose progress is IN_PROGRESS
  const currentStep = useMemo<StepWithCoords | null>(() => {
    if (!hunt || !participation) return null;
    const active = participation.progresses.find((p) => p.statut === 'IN_PROGRESS');
    if (!active) return null;
    return (hunt.steps.find((s) => s.id === active.refStep) as StepWithCoords) ?? null;
  }, [hunt, participation]);

  // Haversine geofence check
  useEffect(() => {
    if (!userCoords || !currentStep?.latitude || !currentStep?.longitude) return;
    const d = haversineDistance(
      userCoords.lat,
      userCoords.lon,
      currentStep.latitude,
      currentStep.longitude,
    );
    setInZone(d <= currentStep.radius);
  }, [userCoords, currentStep]);

  const distance = useMemo(() => {
    if (!userCoords || !currentStep?.latitude || !currentStep?.longitude) return null;
    return haversineDistance(
      userCoords.lat,
      userCoords.lon,
      currentStep.latitude,
      currentStep.longitude,
    );
  }, [userCoords, currentStep]);

  const handleEnterAR = () => {
    if (!currentStep || !inZone) return;
    router.push(`/hunts/${huntId}/game/ar?participationId=${participationId}&stepId=${currentStep.id}`);
  };

  // Hunt completed (no more IN_PROGRESS step)
  const isCompleted = !loading && participation?.status === 'COMPLETED';

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Chargement…</span>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <Trophy size={56} className="text-amber-500" />
        <h1 className="text-2xl font-bold">Chasse terminée !</h1>
        <p className="text-muted-foreground">
          Vous avez terminé{' '}
          <span className="font-semibold text-foreground">{hunt?.title}</span> avec{' '}
          <span className="font-semibold text-foreground">{participation?.totalPoints} pts</span>.
        </p>
        <button
          onClick={() => router.replace('/')}
          className="mt-4 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top half — Leaflet map */}
      <div className="relative h-1/2 w-full">
        <GameLeafletMap userCoords={userCoords} />
      </div>

      {/* Bottom half — info + action */}
      <div className="flex h-1/2 flex-col gap-4 overflow-y-auto bg-background px-5 py-4">

        {/* Hunt title */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Chasse en cours</p>
          <h1 className="text-lg font-bold leading-tight">{hunt?.title}</h1>
        </div>

        {/* Current step info */}
        {currentStep && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground">
              Étape {currentStep.orderNumber} / {hunt?.steps.length}
            </p>
            <p className="font-semibold">{currentStep.title}</p>
          </div>
        )}

        {/* Distance indicator */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <Navigation
            size={20}
            className={inZone ? 'text-green-500' : 'text-amber-500'}
          />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Distance à la zone</p>
            <p className={`text-lg font-bold ${inZone ? 'text-green-500' : 'text-foreground'}`}>
              {userCoords == null
                ? 'Localisation…'
                : inZone
                  ? 'Vous êtes dans la zone !'
                  : distance != null
                    ? formatDistance(distance)
                    : '—'}
            </p>
          </div>
        </div>

        {/* AR trigger button — always visible, enabled only when in zone */}
        <button
          onClick={handleEnterAR}
          disabled={!inZone}
          className={[
            'mt-auto w-full rounded-xl py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors',
            inZone
              ? 'bg-green-500 hover:bg-green-600 animate-pulse'
              : 'bg-muted text-muted-foreground cursor-not-allowed',
          ].join(' ')}
        >
          {inZone ? 'Utiliser la caméra' : 'Approchez-vous de la zone…'}
        </button>
      </div>
    </div>
  );
}
