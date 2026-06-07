import ProfileForm from "@/components/partner/ProfileForm";
import { cookies } from "next/headers";
import { logoutAction } from "@/lib/actions/auth.actions";

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
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Mon profil</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Gérez vos informations personnelles</p>
                </div>
                <form action={logoutAction}>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Se déconnecter
                    </button>
                </form>
            </div>
            <ProfileForm user={user} />
        </div>
    );

}