import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import StatsView, { type StatsData } from "./StatsView";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export default async function StatsPage() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "ADMIN") redirect("/dashboard");

    const token = (await cookies()).get("auth_token")?.value;
    const res = await fetch(`${API_URL}/stats/all`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    if (!res.ok) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl font-medium">
                    Impossible de charger l&apos;écosystème Lootopia.
                </div>
            </div>
        );
    }

    const result = await res.json();
    return <StatsView data={result.data as StatsData} />;
}
