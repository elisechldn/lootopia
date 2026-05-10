import { cookies } from 'next/headers';
import PartnerSidebar from "@/components/partner/PartnerSidebar";
import AuthProvider from "@/components/partner/AuthProvider";
import ThemeWrapper from "@/components/partner/ThemeWrapper";

async function getSession() {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length < 2 || !parts[1]) return null;
        return JSON.parse(atob(parts[1]));
    } catch { return null; }
}

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
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