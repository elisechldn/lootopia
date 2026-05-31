import { cookies } from 'next/headers';
import PartnerSidebar from "@/components/partner/PartnerSidebar";
import AuthProvider from "@/components/partner/AuthProvider";
import ThemeWrapper from "@/components/partner/ThemeWrapper";

const API_URL = process.env.API_URL ?? 'http://localhost:8000';

async function getSessionWithProfile() {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return null;
    let session: { sub: number; email: string; role: string; firstname?: string; lastname?: string } | null = null;
    try {
        const parts = token.split('.');
        if (parts.length < 2 || !parts[1]) return null;
        session = JSON.parse(atob(parts[1]));
    } catch { return null; }
    if (!session) return null;
    try {
        const res = await fetch(`${API_URL}/users/${session.sub}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
        if (res.ok) {
            const json = await res.json();
            const profile = json.data ?? null;
            return { ...session, profilePicture: profile?.profilePicture ?? null };
        }
    } catch { /* ignore, fallback to session without avatar */ }
    return session;
}

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
    const session = await getSessionWithProfile();
    return (
        <AuthProvider user={session}>
            <ThemeWrapper>
                <PartnerSidebar user={session} />
                <main className="flex-1 bg-background">
                    {children}
                </main>
            </ThemeWrapper>
        </AuthProvider>
    );
}