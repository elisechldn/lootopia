"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { getMeAction, logoutAction } from "@/lib/actions/auth.actions";

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, logout } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    const storedUser = useUserStore.getState().user;
    const pathname = window.location.pathname;
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return;
    if (!storedUser) return;

    getMeAction().then((user) => {
      if (!user) {
        logoutAction().then(() => {
          logout();
          router.replace('/login');
        });
      } else {
        setUser(user);
      }
    });
  }, []);

  return <>{children}</>;
}
