import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import PartnerSidebar from "@/components/partner/PartnerSidebar";
import AuthProvider from "@/components/partner/AuthProvider";
import ThemeWrapper from "@/components/partner/ThemeWrapper";

const API_URL = process.env.API_URL ?? 'http://localhost:8000';

async function getAdminSessionWithProfile() {
    const session = await getSession();
    if (!session) return null;
    // Cloisonnement : seul ADMIN accède à l'espace d'administration.
    if (session.role !== 'ADMIN') return null;

    const token = (await cookies()).get('auth_token')?.value;
    try {
        const res = await fetch(`${API_URL}/users/me`, {
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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getAdminSessionWithProfile();
    if (!session) redirect('/login');
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
