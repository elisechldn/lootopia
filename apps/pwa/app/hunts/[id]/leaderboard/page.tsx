import Link from 'next/link';
import { Trophy, Medal, Clock, Star, ListChecks } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import {
  getLeaderboardAction,
  getMyParticipationsAction,
} from '@/lib/actions/participation.actions';
import { formatDuration } from '@/lib/time';

type Props = { params: Promise<{ id: string }> };

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
  const [entries, participations] = await Promise.all([
    getLeaderboardAction(Number(id)),
    getMyParticipationsAction(),
  ]);
  // Lien vers le détail du parcours réservé au joueur ayant terminé cette chasse.
  const hasCompleted = participations.some(
    (p) => p.refHunt === Number(id) && p.status === 'COMPLETED',
  );

  return (
    <main className="flex min-h-screen flex-col bg-background pt-safe">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <BackButton href={`/hunts/${id}`} variant="muted" />
        <h1 className="text-lg font-bold">Classement</h1>
      </header>

      <div className="flex flex-col gap-3 px-4 py-4">
        {hasCompleted && (
          <Link
            href={`/hunts/${id}/leaderboard/stats`}
            className="flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-colors active:bg-primary/20"
          >
            <ListChecks size={18} />
            Voir le détail de mon parcours
          </Link>
        )}

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
            // totalPoints est déjà le score final (base + bonus), cohérent avec le tri backend.
            const finalScore = Math.round(entry.totalPoints * 100) / 100;
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
                    <span>
                      {formatDuration(
                        new Date(entry.endTime).getTime() -
                          new Date(entry.startTime).getTime(),
                      )}
                    </span>
                  </div>
                </div>

                <div className={`text-right shrink-0 font-bold tabular-nums ${style.text}`}>
                  <p className="text-base">{finalScore}</p>
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
