import { cookies } from "next/headers";
import TreasureHuntDashboard from "@/components/partner/TreasureHuntDashboard";
import { Hunt, HuntStats } from "@/components/partner/types";
import React from "react";

const API_URL = process.env.API_URL ?? 'http://localhost:8000';
console.log("API_URL =", process.env.API_URL);

async function authHeaders(): Promise<Record<string, string>> {
    const token = (await cookies()).get('auth_token')?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function getHunts(): Promise<Hunt[]> {
    const res = await fetch(`${API_URL}/hunts`, {
        cache: 'no-store',
        headers: await authHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
}

async function getStats(): Promise<HuntStats> {
    const res = await fetch(`${API_URL}/hunts/stats`, {
        cache: 'no-store',
        headers: await authHeaders(),
    });
    if (!res.ok) return { total: 0, active: 0, finished: 0, players: 0 };
    const json = await res.json();
    return json.data ?? { total: 0, active: 0, finished: 0, players: 0 };
}

export default async function DashboardPage() {
    const [hunts, stats] = await Promise.all([getHunts(), getStats()]);
    return <TreasureHuntDashboard hunts={hunts} stats={stats} />;
}
