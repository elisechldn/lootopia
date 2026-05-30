import Link from 'next/link';
import { ArrowLeft, Trophy, Medal, Clock, Star } from 'lucide-react';
import { getLeaderboard } from '@/services/participation.service';

type Props = { params: Promise<{ id: string }> };

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

const RANK_STYLES: Record<number, { bg: string; text: string; icon: React.ReactNode }> = {
  1: { bg: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400', icon: <Trophy size={18} className="text-amber-500" /> },
  2: { bg: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700', text: 'text-slate-500', icon: <Medal size={18} className="text-slate-400" /> },
  3: { bg: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800', text: 'text-orange-600 dark:text-orange-400', icon: <Medal size={18} className="text-orange-400" /> },
};

function getRankStyle(rank: number) {
  return RANK_STYLES[rank] ?? { bg: 'bg-card border-border', text: 'text-muted-foreground', icon: <span className="text-sm font-bold tabular-nums">{rank}</span> };
}

export default async function LeaderboardPage({ params }: Props) {
  const { id } = await params;
  const entries = await getLeaderboard(Number(id));

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <Link
          href={`/hunts/${id}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
          aria-label="Retour"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-lg font-bold">Classement</h1>
      </header>

      <div className="flex flex-col gap-3 px-4 py-4">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Star size={40} className="text-muted-foreground/40" />
            <p className="font-medium">Aucun joueur n&apos;a encore terminé cette chasse</p>
            <p className="text-sm text-muted-foreground">Soyez le premier !</p>
          </div>
        ) : (
          entries.map((entry, index) => {
            const rank = index + 1;
            const style = getRankStyle(rank);
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-4 rounded-2xl border px-4 py-3 ${style.bg}`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                  {style.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-sm">
                    {entry.user.firstname} {entry.user.lastname}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={11} />
                    <span>{formatDuration(entry.startTime, entry.endTime)}</span>
                  </div>
                </div>

                <div className={`text-right shrink-0 font-bold tabular-nums ${style.text}`}>
                  <p className="text-base">{entry.totalPoints}</p>
                  <p className="text-xs font-normal text-muted-foreground">pts</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
