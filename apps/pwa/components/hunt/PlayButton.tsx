'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, Play } from 'lucide-react';
import { Button }        from '@/components/ui/Button';
import { useUserStore }  from '@/store/userStore';
import { getMyParticipationsAction, startHuntAction } from "@/lib/actions/participation.actions";

type PlayButtonProps = {
  huntId: string;
};

export default function PlayButton({ huntId }: PlayButtonProps) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mounted) return;
    getMyParticipationsAction().then((participations) => {
      console.log("participations => ", participations);
      console.log("useEffect USER => ", user);
      setUser({ ...user!, participations });
    });
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const alreadyStarted = user?.participations.some((p) => p.refHunt === +huntId) ?? false;
  const alreadyCompleted = user?.participations.some(
    (p) => p.refHunt === +huntId && p.status === 'COMPLETED'
  ) ?? false;

  const handlePlay = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const doe = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      if (typeof doe.requestPermission === 'function') await doe.requestPermission();
      const participation = await startHuntAction(Number(huntId));
      router.push(`/hunts/${huntId}/game/map?participationId=${participation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de démarrer');
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (alreadyCompleted) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-5 text-green-600 dark:text-green-400">
        <CheckCircle size={22} className="shrink-0" />
        <p className="font-semibold text-base">Vous avez terminé cette chasse</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        onClick={handlePlay}
        disabled={loading}
        className={[
          'w-full p-10 text-base font-bold uppercase tracking-widest flex items-center gap-2',
          alreadyStarted
            ? 'border-2 border-primary bg-card text-primary hover:bg-primary/5'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <>
            <Play size={20} />
            {alreadyStarted ? 'Continuer la chasse' : 'Participer'}
          </>
        )}
      </Button>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}
