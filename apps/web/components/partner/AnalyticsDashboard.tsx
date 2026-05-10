"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface HuntAnalytics {
    id: number;
    title: string;
    status: string;
    totalParticipants: number;
    completedCount: number;
    inProgressCount: number;
    avgDurationMinutes: number | null;
    totalClueUsages: number;
    stepsCount: number;
}

interface Props {
    data: HuntAnalytics[];
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="bg-card border border-border rounded-xl px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
        </div>
    );
}

function formatDuration(minutes: number | null): string {
    if (minutes === null || minutes <= 0) return "—";
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, string> = {
        ACTIVE: "bg-green-50 text-green-700 border-green-200",
        FINISHED: "bg-muted/50 text-muted-foreground border-border",
        DRAFT: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
    const labels: Record<string, string> = {
        ACTIVE: "Active",
        FINISHED: "Terminée",
        DRAFT: "Brouillon",
    };
    return (
        <Badge variant="outline" className={variants[status] ?? ""}>
            {labels[status] ?? status}
        </Badge>
    );
}

export default function AnalyticsDashboard({ data }: Props) {
    const [search, setSearch] = useState("");

    const filtered = data.filter(h =>
        h.title.toLowerCase().includes(search.toLowerCase())
    );

    // Totaux globaux
    const totalParticipants = data.reduce((s, h) => s + h.totalParticipants, 0);
    const totalCompleted = data.reduce((s, h) => s + h.completedCount, 0);
    const totalClues = data.reduce((s, h) => s + h.totalClueUsages, 0);
    const avgDurations = data.filter(h => h.avgDurationMinutes !== null).map(h => h.avgDurationMinutes as number);
    const globalAvgDuration = avgDurations.length > 0
        ? Math.round(avgDurations.reduce((s, v) => s + v, 0) / avgDurations.length)
        : null;

    return (
        <div className="space-y-6">

            {/* Cartes globales */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard label="Total participants" value={totalParticipants} />
                <StatCard label="Chasses complétées" value={totalCompleted} sub="toutes chasses confondues" />
                <StatCard label="Durée moyenne" value={formatDuration(globalAvgDuration)} sub="par chasse complétée" />
                <StatCard label="Indices demandés" value={totalClues} sub="total" />
            </div>

            {/* Recherche */}
            <div className="bg-card border border-border rounded-xl px-5 py-4">
                <div className="relative max-w-xs">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                         className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                    </svg>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher une chasse..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                </div>
            </div>

            {/* Tableau */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground">Détail par chasse</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="h-12 border-b border-border">
                            <th className="px-5 text-left text-xs font-medium text-muted-foreground">Chasse</th>
                            <th className="px-5 text-left text-xs font-medium text-muted-foreground">Statut</th>
                            <th className="px-5 text-left text-xs font-medium text-muted-foreground">Étapes</th>
                            <th className="px-5 text-left text-xs font-medium text-muted-foreground">Participants</th>
                            <th className="px-5 text-left text-xs font-medium text-muted-foreground">Complétées</th>
                            <th className="px-5 text-left text-xs font-medium text-muted-foreground">En cours</th>
                            <th className="px-5 text-left text-xs font-medium text-muted-foreground">Durée moy.</th>
                            <th className="px-5 text-left text-xs font-medium text-muted-foreground">Indices utilisés</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-5 py-10 text-center text-sm text-muted-foreground/70">
                                    Aucune chasse trouvée
                                </td>
                            </tr>
                        ) : (
                            filtered.map(hunt => (
                                <tr key={hunt.id} className="h-16 border-b border-border last:border-0">
                                    <td className="px-5">
                                        <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                                            {hunt.title}
                                        </p>
                                    </td>
                                    <td className="px-5">
                                        <StatusBadge status={hunt.status} />
                                    </td>
                                    <td className="px-5 text-sm text-foreground/80">{hunt.stepsCount}</td>
                                    <td className="px-5 text-sm text-foreground/80">{hunt.totalParticipants}</td>
                                    <td className="px-5">
                                            <span className="text-sm font-medium text-green-600">
                                                {hunt.completedCount}
                                            </span>
                                    </td>
                                    <td className="px-5">
                                            <span className="text-sm text-blue-600">
                                                {hunt.inProgressCount}
                                            </span>
                                    </td>
                                    <td className="px-5 text-sm text-foreground/80">
                                        {formatDuration(hunt.avgDurationMinutes)}
                                    </td>
                                    <td className="px-5 text-sm text-foreground/80">
                                        {hunt.totalClueUsages}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}