"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";

interface Props {
    user: { sub: number; email: string; role: string; firstname?: string; lastname?: string } | null;
    children: React.ReactNode;
}

export default function AuthProvider({ user, children }: Props) {
    const setUser = useAuthStore((s) => s.setUser);

    useEffect(() => {
        setUser(user);
    }, [user, setUser]);

    return <>{children}</>;
}