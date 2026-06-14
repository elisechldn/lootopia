'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, LogOut, Trophy, CheckCircle, Clock, Gift, ChevronRight } from 'lucide-react';
import TopBar           from '@/components/ui/TopBar';
import TabNavigation    from '@/components/ui/TabNavigation';
import { useUserStore } from '@/store/userStore';
import { getMyParticipationsAction } from '@/lib/actions/participation.actions';
import { logoutAction } from '@/lib/actions/auth.actions';
import { uploadAvatarAction } from '@/lib/actions/profile.actions';
import { assetUrl } from '@/lib/assets';
import { formatRewardType } from '@/lib/reward';
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

  // Une chasse terminée avec au moins 1 point = une récompense débloquée
  // (terminer à 0 point ne donne pas accès à la récompense).
  const rewards = participations.filter((p) => p.status === 'COMPLETED' && p.totalPoints > 0);

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

        {/* Mes récompenses */}
        <div className="px-4 pt-4">
          <h2 className="font-semibold mb-3">Mes récompenses</h2>

          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : rewards.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Terminez une chasse pour débloquer des récompenses.
            </p>
          ) : (
            <div className="space-y-3">
              {rewards.map((p) => (
                <Link
                  key={p.id}
                  href={`/hunts/${p.refHunt}/reward`}
                  className="flex items-center gap-3 p-3 rounded-[15px] border border-border bg-card shadow-sm transition-colors active:bg-foreground/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                    <Gift size={18} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.hunt.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRewardType(p.hunt.rewardType)}
                    </p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
                </Link>
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
