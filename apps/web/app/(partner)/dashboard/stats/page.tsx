"use client";

import { useState, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────
type StatsData = {
    hunts: {
        total: number;
        byStatus: { status: string; count: number }[];
        topPopular: { title: string; participations: number }[];
    };
    participations: {
        total: number;
        byStatus: { status: string; count: number }[];
        averageScore: number; // NOUVEAU
    };
    users: {
        total: number;
        newLast30Days: number; // NOUVEAU
        byRole: { role: string; count: number }[];
        topCountries: { country: string; count: number }[];
    };
    gameplay: {
        arModesDistribution: { mode: string; count: number }[];
        totalCluesUsed: number;
    };
    recentActivity: { // NOUVEAU
        username: string;
        huntTitle: string;
        status: string;
        points: number;
        date: string;
    }[];
};

export default function StatsPage() {
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const response = await fetch(`${apiUrl}/stats/all`);
                if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
                
                const result = await response.json();
                setData(result.data); 
            } catch (err) {
                console.error("Erreur de récupération:", err);
                setError("Impossible de charger l'écosystème Lootopia.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto animate-pulse space-y-6">
                <div className="h-10 bg-muted rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-40 bg-muted rounded-2xl col-span-2"></div>
                    <div className="h-40 bg-muted rounded-2xl"></div>
                    <div className="h-64 bg-muted rounded-2xl"></div>
                    <div className="h-64 bg-muted rounded-2xl col-span-2"></div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl font-medium">
                    {error}
                </div>
            </div>
        );
    }

    // Fonction utilitaire pour formater la date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-background min-h-screen">
            {/* Header avec tendance */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Écosystème Lootopia</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Vue d'ensemble et télémétrie en temps réel de votre plateforme.
                    </p>
                </div>
                <div className="flex gap-6 items-end">
                    <div className="text-right flex flex-col items-end">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Joueurs</p>
                        <div className="flex items-center gap-2">
                            <p className="text-3xl font-black text-primary">{data.users.total}</p>
                            <span className="bg-green-500/10 text-green-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                +{data.users.newLast30Days} <span className="hidden sm:inline">ce mois-ci</span>
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* LIGNE 1 : Activité des Chasses (2 col) + Gameplay (1 col) */}
                <div className="md:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <MapIcon /> État des Chasses
                        </h2>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                            {data.hunts.total} au total
                        </span>
                    </div>
                    <div className="space-y-4">
                        {data.hunts.byStatus.map((statusItem) => (
                            <ProgressBar 
                                key={statusItem.status}
                                label={statusItem.status} 
                                value={statusItem.count} 
                                total={data.hunts.total} 
                                colorClass="bg-blue-500"
                            />
                        ))}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <ARIcon /> Technologies AR
                        </h2>
                        <div className="space-y-3">
                            {data.gameplay.arModesDistribution.map(mode => (
                                <div key={mode.mode} className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border border-border/50">
                                    <span className="text-sm font-medium">{mode.mode}</span>
                                    <span className="font-bold">{mode.count} étapes</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border flex justify-between items-end">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Indices Révélés</p>
                            <p className="text-3xl font-black flex items-center gap-2 text-orange-500">
                                <SearchIcon /> {data.gameplay.totalCluesUsed}
                            </p>
                        </div>
                    </div>
                </div>

                {/* LIGNE 2 : Leaderboard (1 col) + Participations & Démographie (2 col) */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                        <TrophyIcon /> Top 5 Populaire
                    </h2>
                    <div className="space-y-4">
                        {data.hunts.topPopular.length > 0 ? (
                            data.hunts.topPopular.map((hunt, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-400/20 text-yellow-600' : idx === 1 ? 'bg-slate-300/40 text-slate-600' : idx === 2 ? 'bg-orange-400/20 text-orange-600' : 'bg-muted text-muted-foreground'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-semibold truncate">{hunt.title}</p>
                                    </div>
                                    <div className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">
                                        {hunt.participations} j.
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Aucune chasse jouée</p>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                    
                    {/* Colonne Participations */}
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                            <FlagIcon /> Participations
                        </h2>
                        <div className="flex gap-4 mb-6">
                            <div>
                                <span className="text-3xl font-black">{data.participations.total}</span>
                                <p className="text-xs text-muted-foreground">sessions</p>
                            </div>
                            <div className="pl-4 border-l border-border">
                                <span className="text-3xl font-black text-primary">{data.participations.averageScore}</span>
                                <p className="text-xs text-muted-foreground">pts moyens</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {data.participations.byStatus.map(status => (
                                <ProgressBar 
                                    key={status.status}
                                    label={status.status} 
                                    value={status.count} 
                                    total={data.participations.total} 
                                    colorClass={status.status === 'COMPLETED' ? 'bg-green-500' : status.status === 'ABANDONED' ? 'bg-red-500' : 'bg-primary'}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Colonne Démographie */}
                    <div className="border-l-0 md:border-l border-border md:pl-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                            <UsersIcon /> Base Utilisateurs
                        </h2>
                        
                        <div className="mb-6">
                            <h3 className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Répartition par rôle</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.users.byRole.map((role) => (
                                    <div key={role.role} className="flex flex-col bg-muted/30 px-3 py-2 rounded-lg border border-border/50 flex-1 min-w-[80px]">
                                        <span className="text-xs text-muted-foreground">{role.role}</span>
                                        <span className="text-lg font-bold">{role.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Top Pays</h3>
                            <div className="space-y-2">
                                {data.users.topCountries.slice(0, 3).map((country, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2">
                                            <span className="text-muted-foreground font-mono">{idx + 1}.</span> 
                                            {country.country}
                                        </span>
                                        <span className="font-semibold bg-muted px-2 py-0.5 rounded text-xs">{country.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* LIGNE 3 : Activité Récente (Pleine largeur) */}
                <div className="md:col-span-3 bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                        <ActivityIcon /> Activité Récente
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {data.recentActivity.length > 0 ? (
                            data.recentActivity.map((activity, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-muted/20 border border-border/50 flex flex-col justify-between">
                                    <div className="mb-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${activity.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : activity.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {activity.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold mb-1 truncate" title={activity.huntTitle}>
                                        {activity.huntTitle}
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        par <span className="font-medium text-foreground">{activity.username}</span>
                                    </p>
                                    <div className="flex justify-between items-center text-xs mt-auto pt-3 border-t border-border/50">
                                        <span className="font-bold">{activity.points} pts</span>
                                        <span className="text-muted-foreground">{formatDate(activity.date)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground md:col-span-5 text-center">Aucune activité récente.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

// ── Composants Utilitaires & Icônes ───────────────────────────────────────
function ProgressBar({ label, value, total, colorClass }: { label: string, value: number, total: number, colorClass: string }) {
    const percent = total === 0 ? 0 : Math.round((value / total) * 100);
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-muted-foreground">{label}</span>
                <span className="font-bold">{value} <span className="text-muted-foreground font-normal">({percent}%)</span></span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${colorClass} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
            </div>
        </div>
    );
}

function ActivityIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function MapIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>; }
function SearchIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>; }
function UsersIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>; }
function FlagIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.15.743a9 9 0 01-6.15-.726l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>; }
function TrophyIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M18.75 4.236c.982.143 1.954.317 2.916.52a6.003 6.003 0 01-5.395 4.972M10.5 8.111l-.81-.81a1.5 1.5 0 010-2.122l.81-.81m2.999 3.742l.81-.81a1.5 1.5 0 000-2.122l-.81-.81" /></svg>; }
function ARIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5m13.5-3.75H18A2.25 2.25 0 0120.25 6v1.5m-16.5 9V18A2.25 2.25 0 006 20.25h1.5m13.5-3.75V18A2.25 2.25 0 0118 20.25h-1.5M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /></svg>; }