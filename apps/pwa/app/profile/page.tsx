'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Trophy, CheckCircle, Clock } from 'lucide-react';
import TopBar                                 from '@/components/ui/TobBar/TopBar';
import TabNavigation                          from '@/components/ui/TabNavigation/TabNavigation';
import { useUserStore } from '@/store/userStore';
import { getMyParticipations } from '@/services/participation.service';
import { logoutAction } from '@/lib/actions/auth.actions';
import { assetUrl } from '@/lib/assets';
import { type Prisma } from '@repo/types';

type Participation = Prisma.ParticipationGetPayload<{
  select: {
    id: true;
    status: true;
    totalPoints: true;
    startTime: true;
    endTime: true;
    hunt: {
      select: {
        title: true;
        coverImage: true;
        rewardType: true;
        rewardValue: true;
      };
    };
  };
}>;

const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  ABANDONED: 'Abandonnée',
};

const STATUS_COLORS: Record<string, string> = {
  IN_PROGRESS: 'text-blue-500',
  COMPLETED: 'text-green-500',
  ABANDONED: 'text-muted-foreground',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useUserStore();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    getMyParticipations(user.id).then((data) => {
      setParticipations(data as Participation[]);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    logout();
    router.replace('/login');
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen">
      <TopBar />

      <div className="flex-1 overflow-y-auto pt-14 pb-16">
        {/* En-tête profil */}
        <div className="px-4 py-6 flex items-center gap-4 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {user.firstname[0]}{user.lastname[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg">{user.firstname} {user.lastname}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Se déconnecter"
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Statistiques rapides */}
        {!loading && (
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            <Stat
              label="Participées"
              value={participations.length}
              icon={<Clock size={16} />}
            />
            <Stat
              label="Terminées"
              value={participations.filter((p) => p.status === 'COMPLETED').length}
              icon={<CheckCircle size={16} />}
            />
            <Stat
              label="Points"
              value={participations.reduce((s, p) => s + p.totalPoints, 0)}
              icon={<Trophy size={16} />}
            />
          </div>
        )}

        {/* Historique des chasses */}
        <div className="px-4 pt-4">
          <h2 className="font-semibold mb-3">Mes chasses</h2>

          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : participations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Vous n&apos;avez pas encore participé à une chasse.
            </p>
          ) : (
            <div className="space-y-3">
              {participations.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {p.hunt.coverImage && (
                      <img
                        src={assetUrl(p.hunt.coverImage)!}
                        alt={p.hunt.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.hunt.title}</p>
                    <p className={`text-xs ${STATUS_COLORS[p.status] ?? 'text-muted-foreground'}`}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold">{p.totalPoints} pts</p>
                    {p.hunt.rewardValue && p.status === 'COMPLETED' && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 truncate max-w-[80px]">
                        {p.hunt.rewardValue}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TabNavigation />
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center py-4 gap-1">
      <div className="text-muted-foreground">{icon}</div>
      <p className="font-bold text-lg leading-none">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
