import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import PartnerSidebar from "@/components/partner/PartnerSidebar";
import AuthProvider from "@/components/partner/AuthProvider";
import ThemeWrapper from "@/components/partner/ThemeWrapper";
import { API_URL } from "@/lib/api";

async function getSessionWithProfile() {
    const session = await getSession();
    if (!session) return null;
    if (session.role !== 'PARTNER' && session.role !== 'ADMIN') return null;

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
    } catch {

    }
    return session;
}

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
    const session = await getSessionWithProfile();
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
