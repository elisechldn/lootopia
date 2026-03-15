import { create } from 'zustand';

interface AuthUser {
    sub: number;
    email: string;
    role: string;
    firstname?: string;
    lastname?: string;
}

interface AuthStore {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
}));