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
            actionType: true;
            points: true;
          };
        };
      };
    };
  };
}>;

export type ParticipationsType = ParticipationType[];

export type UserInfos = Pick<User, 'id' | 'email' | 'firstname' | 'lastname' | 'role'> & { participations: ParticipationsType; };

type UserStore = {
  user: UserInfos | null;
  setUser: (user: UserInfos) => void;
  logout: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'user_infos',
    },
  ),
);
