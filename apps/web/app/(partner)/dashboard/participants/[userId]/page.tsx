import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PlayerStatsDashboard, { type PlayerParticipation } from "@/components/partner/PlayerStatsDashboard";

async function getPlayerParticipations(userId: string): Promise<PlayerParticipation[]> {
    const token = (await cookies()).get("auth_token")?.value;
    const res = await fetch(
        `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL}/participations/player/${userId}`,
        {
            cache: "no-store",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? json) as PlayerParticipation[];
}

export default async function PlayerPage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;
    const participations = await getPlayerParticipations(userId);

    if (participations.length === 0) notFound();

    const user = participations[0]!.user;

    return (
        <div className="p-8 max-w-6xl">
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href="/dashboard/participants"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted"
                    aria-label="Retour"
                >
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {user.firstname} {user.lastname}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Statistiques du joueur
                    </p>
                </div>
            </div>
            <PlayerStatsDashboard participations={participations} user={user} />
        </div>
    );
}
