'use client';

import { use, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Navigation, Trophy, Loader2, MapPin, ScanLine, ArrowLeft, AlertTriangle } from 'lucide-react';
import { type GameParticipation, type GameStep } from '@/services/participation.service';
import { getParticipationByIdAction } from '@/lib/actions/participation.actions';
import { haversineDistance, formatDistance } from '@/lib/geo';
import { assetUrl } from '@/lib/assets';
import HintBubbles from '@/components/game/hints/HintBubbles';
import HintModal from '@/components/game/hints/HintModal';
import Image from 'next/image';

const GameLeafletMap = dynamic(() => import('@/components/game/GameLeafletMap'), { ssr: false });

type Props = { params: Promise<{ id: string }> };

export default function GameMapPage({ params }: Props) {
  const { id: huntId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const participationId = searchParams.get('participationId');

  const [participation, setParticipation] = useState<GameParticipation | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [inZone, setInZone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [, startClueTransition] = useTransition();

  // Fetch participation (inclut la chasse + ses étapes avec coordonnées).
  useEffect(() => {
    if (!participationId) return;
    getParticipationByIdAction(+participationId).then((participationRes) => {
      setParticipation(participationRes);
      setLoading(false);
    });
  }, [participationId]);

  const hunt = participation?.hunt ?? null;

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
  const currentStep = useMemo<GameStep | null>(() => {
    if (!hunt || !participation) return null;
    const active = participation.progresses.find((p) => p.statut === 'IN_PROGRESS');
    if (!active) return null;
    return hunt.steps.find((s) => s.id === active.refStep) ?? null;
  }, [hunt, participation]);

  // L'étape courante est-elle la dernière de la chasse ?
  const isLastStep = useMemo(() => {
    if (!hunt || !currentStep) return false;
    const maxOrder = Math.max(...hunt.steps.map((s) => s.orderNumber));
    return currentStep.orderNumber === maxOrder;
  }, [hunt, currentStep]);

  // Current active progress
  const currentProgress = useMemo(() => {
    if (!participation) return null;
    return participation.progresses.find((p) => p.statut === 'IN_PROGRESS') ?? null;
  }, [participation]);

  // Live overall score: banked points from completed steps, plus the running
  // penalty delta of the in-progress step (currentProgress.totalPoints already
  // nets out penalties applied so far, vs. the step's base point value).
  const livePoints = useMemo(() => {
    const banked =
      participation?.progresses
        .filter((p) => p.statut === 'COMPLETED')
        .reduce((sum, p) => sum + p.totalPoints, 0) ?? 0;

    const currentPenaltyDelta =
      currentProgress && currentStep ? currentProgress.totalPoints - currentStep.points : 0;

    return banked + currentPenaltyDelta;
  }, [participation, currentProgress, currentStep]);

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

  const handleEnterAR = async () => {
    if (!currentStep) return;
    setCameraPermissionDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      router.push(
        `/hunts/${huntId}/game/ar?participationId=${participationId}&stepId=${currentStep.id}`,
      );
    } catch (err) {
      if (
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
      ) {
        setCameraPermissionDenied(true);
      }
    }
  };

  // Refresh participation after last clue reveal
  const handleProgressChanged = () => {
    if (!participationId) return;
    startClueTransition(async () => {
      const updated = await getParticipationByIdAction(+participationId);
      setParticipation(updated);
    });
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
    // Détail dérivé des étapes complétées ; le score final est figé sur la participation.
    const completed = participation?.progresses.filter((p) => p.statut === 'COMPLETED') ?? [];
    const basePoints = completed.reduce((s, p) => s + p.totalPoints, 0);
    const timeBonus = Math.round(completed.reduce((s, p) => s + p.timeBonus, 0) * 100) / 100;
    const finalScore = participation?.totalPoints ?? 0;
    // Règle : terminer avec 0 point de base ne débloque aucune récompense.
    const hasReward = basePoints > 0;
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <Trophy size={56} className={hasReward ? 'text-amber-500' : 'text-muted-foreground/50'} />
        <h1 className="text-2xl font-bold">Chasse terminée !</h1>
        <p className="text-muted-foreground">
          Vous avez terminé{' '}
          <span className="font-semibold text-foreground">{hunt?.title}</span>.
        </p>

        <div className="rounded-xl border border-border bg-card px-5 py-3 text-sm text-muted-foreground">
          <div className="flex justify-between gap-6">
            <span>Points</span>
            <span className="font-semibold text-foreground tabular-nums">{basePoints}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span>Bonus de temps</span>
            <span className="font-semibold text-foreground tabular-nums">+{timeBonus}</span>
          </div>
          <div className="mt-1 flex justify-between gap-6 border-t border-border pt-1 text-base">
            <span className="text-foreground">Score final</span>
            <span className="font-bold text-foreground tabular-nums">{finalScore} pts</span>
          </div>
        </div>

        {hasReward ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            La récompense est disponible depuis votre profil.
          </p>
        ) : (
          <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Vous terminez avec 0 point : aucune récompense n&apos;est débloquée.
          </p>
        )}

        <button
          onClick={() => router.replace('/')}
          className="mt-4 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground active:opacity-90"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="flex h-screen flex-col">
      {/* Map */}
      <div className="relative h-[42vh] w-full sm:h-[50vh]">
        <GameLeafletMap userCoords={userCoords} />
        <button
          onClick={() => setShowExitModal(true)}
          className="absolute top-safe-4 left-4 z-[500] flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/50 active:bg-black/50"
          aria-label="Retour"
        >
          <ArrowLeft size={18}/>
        </button>
      </div>

      {/* Hints strip — horizontal row below map */}
      {currentProgress && (
        <div className="w-full shrink-0 border-b border-border bg-background/95 px-4 py-2">
          <HintBubbles
            progressId={currentProgress.id}
            totalPoints={currentProgress.totalPoints}
            participationPoints={livePoints}
            isLastStep={isLastStep}
            onProgressChanged={handleProgressChanged}
          />
        </div>
      )}

      {/* Info + action — fills remaining space */}
      <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto bg-background px-4 py-3 pb-[calc(5rem+env(safe-area-inset-bottom,1rem))] sm:px-5 sm:py-4">

        {/* Hunt title */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Chasse en cours</p>
          <h1 className="text-base font-bold leading-tight sm:text-lg">{hunt?.title}</h1>
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

        {/* Step type instruction */}
        {currentStep && (
          <div className={`flex flex-col gap-2 rounded-xl border px-4 py-3 text-sm ${
            currentStep.arMode === 'MARKER'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
          }`}>
            <div className="flex items-start gap-3">
              {currentStep.arMode === 'MARKER' ? (
                <ScanLine size={18} className="shrink-0 mt-0.5" />
              ) : (
                <MapPin size={18} className="shrink-0 mt-0.5" />
              )}
              <p>
                {currentStep.arMode === 'MARKER'
                  ? "Rendez-vous dans la prochaine zone, puis trouvez l'objet à scanner avec votre caméra."
                  : 'Trouvez et rendez-vous dans la prochaine zone.'}
              </p>
            </div>
            {currentStep.arMode === 'MARKER' && assetUrl(currentStep.markerImageUrl) && (
              <div className="flex flex-col items-center gap-1">
                <div className="h-24 w-24 rounded-lg overflow-hidden self-center border border-amber-500/20 bg-white/50 relative">
                  <Image
                    src={assetUrl(currentStep.markerImageUrl)!}
                    alt="Aperçu de l'objet à scanner"
                    fill
                    className="object-cover scale-[2.5]"
                    style={{ transformOrigin: 'center' }}
                  />
                </div>
                <span className="text-[10px] opacity-60">Aperçu partiel</span>
              </div>
            )}
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

      </div>
    </div>

      {/* AR trigger button — fixed above safe area */}
      <div className="fixed bottom-0 left-0 right-0 z-[500] bg-background/95 backdrop-blur-sm px-4 pt-3 pb-safe-3 space-y-1 border-t border-border">
        <button
          onClick={() => void handleEnterAR()}
          className="w-full rounded-xl bg-green-500 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-green-600 active:bg-green-700"
        >
          Utiliser la caméra AR
        </button>
        {!inZone && (
          <p className="text-center text-xs text-muted-foreground">
            Approchez-vous de la zone pour valider l&apos;étape après scan
          </p>
        )}
        {cameraPermissionDenied && (
          <p className="text-center text-xs text-amber-600">
            Permission caméra refusée. Activez-la dans les réglages du navigateur (Site → Caméra → Autoriser).
          </p>
        )}
      </div>

      {showExitModal && (
        <HintModal onClose={() => setShowExitModal(false)}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle size={22} className="shrink-0 text-amber-500" />
              <h2 className="font-bold text-base">Quitter la chasse ?</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le temps de la chasse continuera de tourner tant que vous n&apos;avez pas terminé le parcours.
            </p>
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold transition-colors hover:bg-muted active:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={() => router.replace('/')}
                className="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 active:opacity-90"
              >
                Quitter
              </button>
            </div>
          </div>
        </HintModal>
      )}
    </>
  );
}
