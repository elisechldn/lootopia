import TreasureHuntDashboard from "@/components/partner/TreasureHuntDashboard";
import { Hunt, HuntStats } from "@/components/partner/types";

async function getHunts(): Promise<Hunt[]> {
    const res = await fetch(
        `${process.env.API_URL}/hunts`,
        { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
}

async function getStats(): Promise<HuntStats> {
    const res = await fetch(
        `${process.env.API_URL}/hunts/stats`,
        { cache: 'no-store' }
    );
    if (!res.ok) return { total: 0, active: 0, finished: 0, players: 0 };
    const json = await res.json();
    return json.data ?? { total: 0, active: 0, finished: 0, players: 0 };
}

export default async function DashboardPage() {
    const [hunts, stats] = await Promise.all([getHunts(), getStats()]);
    return <TreasureHuntDashboard hunts={hunts} stats={stats} />;
}