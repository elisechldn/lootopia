'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Medal, Star, ChevronRight } from 'lucide-react';
import TopBar from '@/components/ui/TopBar';
import TabNavigation from '@/components/ui/TabNavigation';
import { useUserStore } from '@/store/userStore';
import {
  getMyParticipationsAction,
  getLeaderboardAction,
} from '@/lib/actions/participation.actions';
import { assetUrl } from '@/lib/assets';

// Forme runtime renvoyée par /participations/me (plus large que le type du store).
type MyParticipation = {
  refHunt: number;
  totalPoints: number;
  timeBonus: number;
  hunt: { title: string; coverImage: string | null };
};

type RankedHunt = {
  refHunt: number;
  title: string;
  coverImage: string | null;
  points: number;
  /** Rang du joueur dans le classement de la chasse (null si non classé). */
  rank: number | null;
  /** Nombre total de joueurs classés sur la chasse. */
  total: number;
};

/** Badge de rang : médailles pour le podium, numéro sinon. */
function RankBadge({ rank }: { rank: number | null }) {
  if (rank === 1) return <Trophy size={20} className="text-amber-500" />;
  if (rank === 2) return <Medal size={20} className="text-slate-400" />;
  if (rank === 3) return <Medal size={20} className="text-orange-400" />;
  return (
    <span className="text-sm font-bold tabular-nums text-muted-foreground">
      {rank ? `#${rank}` : '—'}
    </span>
  );
}

export default function LeaderBoardPage() {
  const { user } = useUserStore();
  const greeting = user ? `Bonjour ${user.firstname} !` : '';

  const [hunts, setHunts] = useState<RankedHunt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const participations = (await getMyParticipationsAction()) as unknown as MyParticipation[];
      const ranked = await Promise.all(
        participations.map(async (p): Promise<RankedHunt> => {
          const entries = await getLeaderboardAction(p.refHunt);
          const index = entries.findIndex((e) => e.user.id === user.id);
          return {
            refHunt: p.refHunt,
            title: p.hunt.title,
            coverImage: p.hunt.coverImage,
            // Score final = points de base + bonus de temps.
            points: Math.round((p.totalPoints + p.timeBonus) * 100) / 100,
            rank: index >= 0 ? index + 1 : null,
            total: entries.length,
          };
        }),
      );
      if (!cancelled) {
        // Classés d'abord (meilleur rang en tête), puis non classés.
        ranked.sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
        setHunts(ranked);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="flex flex-col h-screen pb-tabbar">
      <TopBar greeting={greeting} />

      <div className="flex-1 overflow-y-auto pt-topbar">
        <div className="px-4 pt-4 pb-6 space-y-4">
          <div>
            <h1 className="font-semibold text-lg">Mon classement</h1>
            <p className="text-sm text-muted-foreground">
              Votre position sur chaque chasse à laquelle vous avez participé.
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : hunts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Star size={40} className="text-muted-foreground/40" />
              <p className="font-medium">Aucune participation pour l&apos;instant</p>
              <p className="text-sm text-muted-foreground">
                Rejoignez une chasse pour apparaître au classement.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {hunts.map((h) => (
                <li key={h.refHunt}>
                  <Link
                    href={`/hunts/${h.refHunt}/leaderboard`}
                    className="flex items-center gap-3 rounded-[15px] border border-border bg-card p-3 shadow-sm transition-colors active:bg-foreground/5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                      <RankBadge rank={h.rank} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{h.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.rank
                          ? `${h.rank}${h.rank === 1 ? 'er' : 'e'} sur ${h.total}`
                          : 'Non classé'}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-primary tabular-nums">
                        {h.points} pts
                      </p>
                    </div>

                    <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <TabNavigation />
    </div>
  );
}
