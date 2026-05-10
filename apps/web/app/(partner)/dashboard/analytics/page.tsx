import AnalyticsDashboard from "@/components/partner/AnalyticsDashboard";

async function getAnalytics() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hunts/analytics`,
        { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
}

export default async function AnalyticsPage() {
    const analytics = await getAnalytics();
    return (
        <div className="p-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Analytique</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Performances de vos chasses au trésor
                </p>
            </div>
            <AnalyticsDashboard data={analytics} />
        </div>
    );
}