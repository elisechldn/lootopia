import { notFound } from 'next/navigation';
import { Gift } from 'lucide-react';
import { getHuntRewardAction } from '@/lib/actions/participation.actions';
import { formatRewardType } from '@/lib/reward';
import BackButton from '@/components/ui/BackButton';

type Props = { params: Promise<{ id: string }> };

export default async function RewardPage({ params }: Props) {
  const { id } = await params;
  const reward = await getHuntRewardAction(Number(id));

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
    </main>
  );
}
