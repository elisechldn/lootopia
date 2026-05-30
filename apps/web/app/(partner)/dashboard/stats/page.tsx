"use client";

import { useState, useEffect } from "react";

// ── Types basés sur ton retour NestJS ────────────────────────────────────────
type StatsData = {
    hunts: {
        total: number;
        byStatus: { status: string; count: number }[];
        topPopular: { title: string; participations: number }[];
    };
    participations: {
        total: number;
        byStatus: { status: string; count: number }[];
    };
    users: {
        total: number;
        byRole: { role: string; count: number }[];
        topCountries: { country: string; count: number }[];
    };
    gameplay: {
        arModesDistribution: { mode: string; count: number }[];
        totalCluesUsed: number;
    };
};

export default function StatsPage() {
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Utilisation d'une variable d'environnement pour l'URL de l'API.
                // Si elle n'est pas définie, on fallback sur localhost par sécurité en dev.
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                
                const response = await fetch(`${apiUrl}/stats/all`);
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                
                const result = await response.json();

                setData(result.data);
            } catch (err) {
                console.error("Erreur lors de la récupération des stats:", err);
                setError("Impossible de charger les statistiques. Vérifiez que le serveur est allumé.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // ── État de chargement (Skeleton) ─────────────────────────────────────────
    if (loading) {
        return (
            <div className="p-8 max-w-5xl animate-pulse">
                <div className="h-8 bg-muted rounded w-48 mb-2"></div>
                <div className="h-4 bg-muted rounded w-64 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-card border border-border rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    // ── État d'erreur ─────────────────────────────────────────────────────────
    if (error || !data) {
        return (
            <div className="p-8 max-w-5xl text-destructive font-medium bg-destructive/10 rounded-xl border border-destructive/20 m-8">
                {error}
            </div>
        );
    }

    // ── Rendu principal ───────────────────────────────────────────────────────
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Vue d'ensemble des statistiques de Lootopia
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Utilisateurs" value={data.users.total} icon={<UsersIcon />} />
                <StatCard title="Chasses Actives" value={data.hunts.total} icon={<MapIcon />} />
                <StatCard title="Participations" value={data.participations.total} icon={<FlagIcon />} />
                <StatCard title="Indices Utilisés" value={data.gameplay.totalCluesUsed} icon={<SearchIcon />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bloc Top Chasses */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-foreground">Top 5 des Chasses</h2>
                    <div className="space-y-3">
                        {data.hunts.topPopular.length > 0 ? (
                            data.hunts.topPopular.map((hunt, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                                    <span className="text-sm font-medium text-foreground">{hunt.title}</span>
                                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">
                                        {hunt.participations} joueurs
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">Aucune donnée disponible.</p>
                        )}
                    </div>
                </div>

                {/* Bloc Démographie */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                    <h2 className="text-sm font-semibold text-foreground">Démographie</h2>
                    
                    <div>
                        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Par Rôle</h3>
                        <div className="flex gap-2 flex-wrap">
                            {data.users.byRole.map((role, idx) => (
                                <span key={idx} className="text-xs border border-border bg-muted/30 px-3 py-1.5 rounded-full text-foreground">
                                    <strong className="font-semibold">{role.role}:</strong> {role.count}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Top Pays</h3>
                        <div className="space-y-2">
                            {data.users.topCountries.slice(0, 3).map((country, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted/20">
                                    <span className="text-foreground flex items-center gap-2">
                                        <span className="text-muted-foreground font-mono">{idx + 1}.</span> {country.country}
                                    </span>
                                    <span className="text-muted-foreground font-medium">{country.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Composants Utilitaires (Cartes et Icônes) ────────────────────────────────

function StatCard({ title, value, icon }: { title: string, value: number | string, icon: React.ReactNode }) {
    return (
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-muted-foreground">{title}</span>
                <div className="text-muted-foreground/50">
                    {icon}
                </div>
            </div>
            <span className="text-2xl font-bold text-foreground">{value}</span>
        </div>
    );
}

// ... Les fonctions d'icônes (UsersIcon, MapIcon, FlagIcon, SearchIcon) restent identiques
function UsersIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    );
}

function MapIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
    );
}

function FlagIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.15.743a9 9 0 01-6.15-.726l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    );
}