import ProfileForm from "@/components/partner/ProfileForm";
import { cookies } from "next/headers";

async function getSession() {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length < 2 || !parts[1]) return null;
        return JSON.parse(atob(parts[1]));
    } catch { return null; }
}

async function getUser(id: number) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
}

export default async function ProfilePage() {
    const session = await getSession();
    if (!session) return null;
    const user = await getUser(session.sub);
    return (
        <div className="p-8 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Mon profil</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Gérez vos informations personnelles</p>
            </div>
            <ProfileForm user={user} />
        </div>
    );
}