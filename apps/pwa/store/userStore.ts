import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Prisma, type User } from '@repo/types';

export type ParticipationType = Prisma.ParticipationGetPayload<{
  include: {
    hunt: { select: { id: true; title: true } };
    progresses: {
      include: {
        step: {
          select: {
            id: true;
            orderNumber: true;
            title: true;
            points: true;
          };
        };
      };
    };
  };
}>;

export type ParticipationsType = ParticipationType[];

export type UserInfos = Pick<User, 'id' | 'email' | 'firstname' | 'lastname' | 'role' | 'profilePicture'> & { participations: ParticipationsType; };

type UserStore = {
  user: UserInfos | null;
  setUser: (user: UserInfos) => void;
  setProfilePicture: (url: string) => void;
  logout: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      setProfilePicture: (url) =>
        set((state) =>
          state.user ? { user: { ...state.user, profilePicture: url } } : state,
        ),
      logout: () => set({ user: null }),
    }),
    {
      name: 'user_infos',
    },
  ),
);
