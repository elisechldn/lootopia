'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, LogOut, Trophy, CheckCircle, Clock, Gift } from 'lucide-react';
import TopBar           from '@/components/ui/TopBar';
import TabNavigation    from '@/components/ui/TabNavigation';
import { useUserStore } from '@/store/userStore';
import { getMyParticipationsAction } from '@/lib/actions/participation.actions';
import { logoutAction } from '@/lib/actions/auth.actions';
import { uploadAvatarAction } from '@/lib/actions/profile.actions';
import { assetUrl } from '@/lib/assets';
import { type Prisma } from '@repo/types';
import Image from "next/image";

type Participation = Prisma.ParticipationGetPayload<{
  select: {
    id: true;
    status: true;
    totalPoints: true;
    startTime: true;
    endTime: true;
    refHunt: true;
    hunt: {
      select: {
        title: true;
        coverImage: true;
        rewardType: true;
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
  const { user, logout, setProfilePicture } = useUserStore();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    getMyParticipationsAction().then((data) => {
      setParticipations(data as unknown as Participation[]);
      setLoading(false);
    });
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { url } = await uploadAvatarAction(formData);
      setProfilePicture(url);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogout = async () => {
    await logoutAction();
    logout();
    router.replace('/login');
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen pb-tabbar">
      <TopBar />

      <div className="flex-1 overflow-y-auto pt-topbar">
        {/* En-tête profil */}
        <div className="px-4 pb-6 flex items-center gap-4 border-b border-border">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="relative block active:opacity-80 transition-opacity disabled:cursor-wait"
              aria-label="Changer l'avatar"
            >
              <div className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
                {user.profilePicture ? (
                  <Image
                    src={assetUrl(user.profilePicture)!}
                    alt="Avatar"
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <span>{user.firstname[0]}{user.lastname[0]}</span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm border-2 border-background pointer-events-none">
                <Camera size={10} />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg">{user.firstname} {user.lastname}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            {avatarUploading && <p className="text-xs text-primary mt-0.5">Upload en cours…</p>}
            {avatarError && <p className="text-xs text-destructive mt-0.5">{avatarError}</p>}
          </div>
          <button
            onClick={handleLogout}
            aria-label="Se déconnecter"
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors active:bg-destructive/10 active:text-destructive"
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
                  className="flex items-center gap-3 p-3 rounded-[15px] border border-border bg-card shadow-sm"
                >
                  {p.hunt.coverImage && (
                  <div className="relative w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                      <Image
                        src={assetUrl(p.hunt.coverImage)!}
                        alt={p.hunt.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                  </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.hunt.title}</p>
                    <p className={`text-xs ${STATUS_COLORS[p.status] ?? 'text-muted-foreground'}`}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold">{p.totalPoints} pts</p>
                    {p.status === 'COMPLETED' && (
                      <Link
                        href={`/hunts/${p.refHunt}/reward`}
                        className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline active:opacity-70"
                      >
                        <Gift size={11} />
                        Récompense
                      </Link>
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
