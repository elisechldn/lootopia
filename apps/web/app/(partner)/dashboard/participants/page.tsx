import { cookies } from "next/headers";
import ParticipantsDashboard from "@/components/partner/ParticipantsDashboard";

async function getParticipants() {
    const token = (await cookies()).get("auth_token")?.value;
    const res = await fetch(
        `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL}/participations/partner`,
        {
            cache: 'no-store',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
}

export default async function ParticipantsPage() {
    const participants = await getParticipants();
    return (
        <div className="p-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Participants</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Joueurs participant à vos chasses au trésor
                </p>
            </div>
            <ParticipantsDashboard data={participants} />
        </div>
    );
}