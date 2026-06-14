import { redirect } from 'next/navigation';
import { Calendar, Flag, Timer, Star, Sparkles } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { getMyParticipationsAction } from '@/lib/actions/participation.actions';
import { formatDuration, formatDateTime } from '@/lib/time';

type Props = { params: Promise<{ id: string }> };

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export default async function StatsPage({ params }: Props) {
  const { id } = await params;
  const participations = await getMyParticipationsAction();

  // Accès réservé au joueur ayant terminé cette chasse.
  const participation = participations.find(
    (p) => p.refHunt === Number(id) && p.status === 'COMPLETED',
  );
  if (!participation) redirect(`/hunts/${id}/leaderboard`);

  const steps = participation.progresses
    .filter((p) => p.statut === 'COMPLETED')
    .sort((a, b) => a.step.orderNumber - b.step.orderNumber);

  return (
    <main className="flex min-h-screen flex-col bg-background pt-safe">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <BackButton href={`/hunts/${id}/leaderboard`} variant="muted" />
        <h1 className="text-lg font-bold">Détail du parcours</h1>
      </header>

      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
          <span className="text-sm font-medium text-primary">Score final</span>
          <span className="text-lg font-bold tabular-nums text-primary">
            {round2(participation.totalPoints)} pts
          </span>
        </div>

        <ul className="flex flex-col gap-3">
          {steps.map((p) => {
            const duration =
              p.completedAt != null
                ? formatDuration(
                    new Date(p.completedAt).getTime() -
                      new Date(p.startedAt).getTime(),
                  )
                : '—';
            return (
              <li
                key={p.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-sm">
                    Étape {p.step.orderNumber} — {p.step.title}
                  </p>
                  <div className="flex items-center gap-1 shrink-0 text-sm font-bold tabular-nums text-foreground">
                    <Timer size={14} className="text-muted-foreground" />
                    {duration}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-green-500" />
                    <span>Début : {formatDateTime(p.startedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Flag size={13} className="text-amber-500" />
                    <span>
                      Fin : {p.completedAt != null ? formatDateTime(p.completedAt) : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t border-border pt-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="text-primary" />
                    <span className="font-semibold tabular-nums">{p.totalPoints}</span>
                    <span className="text-xs text-muted-foreground">pts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span className="font-semibold tabular-nums">
                      +{round2(p.timeBonus)}
                    </span>
                    <span className="text-xs text-muted-foreground">bonus</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
