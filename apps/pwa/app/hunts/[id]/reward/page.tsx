import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Gift, Compass } from 'lucide-react';
import { getHuntRewardAction } from '@/lib/actions/participation.actions';
import { getHuntById } from '@/services/hunt.service';
import { formatRewardType } from '@/lib/reward';
import BackButton from '@/components/ui/BackButton';

type Props = { params: Promise<{ id: string }> };

export default async function RewardPage({ params }: Props) {
  const { id } = await params;
  const [reward, { data: hunt }] = await Promise.all([
    getHuntRewardAction(Number(id)),
    getHuntById(Number(id)),
  ]);

  if (!reward) notFound();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <BackButton href={`/profile`} className="fixed top-safe-4 left-4 z-[1000]" />
      <Gift size={56} className="text-amber-500" />
      <h1 className="text-2xl font-bold">Votre récompense</h1>
      <p className="text-sm text-muted-foreground">{formatRewardType(reward.rewardType)}</p>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-8 py-6 dark:border-amber-800 dark:bg-amber-950">
        <p className="text-3xl font-bold tracking-widest text-amber-700 dark:text-amber-300">
          {reward.rewardValue ?? '—'}
        </p>
      </div>
      {hunt?.partner && (
        <p className="text-sm text-muted-foreground">Organisée par @{hunt.partner.username}</p>
      )}
      <Link
        href={`/hunts/${id}`}
        className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-600 dark:text-amber-400 transition-colors hover:bg-amber-500/20 active:bg-amber-500/30"
      >
        <Compass size={16} className="text-amber-500" />
        Voir le détail de la chasse
      </Link>
    </main>
  );
}
