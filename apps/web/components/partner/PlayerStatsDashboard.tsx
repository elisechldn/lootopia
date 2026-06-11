"use client";

import { Badge } from "@/components/ui/badge";

interface ClueUsage {
    id: number;
    clue: { id: number; penaltyCost: number };
}

interface Progress {
    id: number;
    statut: "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
    totalPoints: number;
    startedAt: string;
    completedAt: string | null;
    step: { id: number; orderNumber: number; title: string; points: number };
    clueUsages: ClueUsage[];
}

export interface PlayerParticipation {
    id: number;
    status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
    totalPoints: number;
    startTime: string;
    endTime: string | null;
    hunt: { id: number; title: string; rewardType: string | null };
    progresses: Progress[];
    user: { id: number; firstname: string; lastname: string; email: string };
}

interface Props {
    participations: PlayerParticipation[];
    user: { id: number; firstname: string; lastname: string; email: string };
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

function StatusBadge({ status }: { status: PlayerParticipation["status"] }) {
    const variants: Record<PlayerParticipation["status"], string> = {
        COMPLETED: "bg-green-50 text-green-700 border-green-200",
        IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
        ABANDONED: "bg-red-50 text-red-500 border-red-200",
    };
    const labels: Record<PlayerParticipation["status"], string> = {
        COMPLETED: "Terminé",
        IN_PROGRESS: "En cours",
        ABANDONED: "Abandonné",
    };
    return (
        <Badge variant="outline" className={variants[status]}>
            {labels[status]}
        </Badge>
    );
}

function formatDuration(start: string, end: string | null): string {
    if (!end) return "—";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export default function PlayerStatsDashboard({ participations, user }: Props) {
    const completed = participations.filter((p) => p.status === "COMPLETED");
    const totalPoints = participations.reduce((s, p) => s + p.totalPoints, 0);
    const completionRate = participations.length > 0
        ? Math.round((completed.length / participations.length) * 100)
        : 0;

    const avgDurationMs = completed.length > 0
        ? completed.reduce((s, p) => {
            if (!p.endTime) return s;
            return s + (new Date(p.endTime).getTime() - new Date(p.startTime).getTime());
        }, 0) / completed.length
        : null;

    const avgDurationStr = avgDurationMs !== null
        ? formatDuration(
            new Date(0).toISOString(),
            new Date(avgDurationMs).toISOString(),
          )
        : "—";

    return (
        <div className="space-y-6">
            {/* Header joueur */}
            <div className="bg-card border border-border rounded-xl px-5 py-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-muted-foreground">
                        {user.firstname[0]}{user.lastname[0]}
                    </span>
                </div>
                <div>
                    <p className="text-base font-bold text-foreground">
                        {user.firstname} {user.lastname}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    label="Chasses participées"
                    value={participations.length}
                />
                <StatCard
                    label="Chasses complétées"
                    value={completed.length}
                    sub={`${completionRate}% de taux de complétion`}
                />
                <StatCard
                    label="Points totaux"
                    value={totalPoints}
                    sub="cumulés toutes chasses"
                />
                <StatCard
                    label="Durée moyenne"
                    value={avgDurationStr}
                    sub="par chasse complétée"
                />
            </div>

            {/* Table détail */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Détail par chasse</h2>
                    <span className="text-xs text-muted-foreground/70">
                        {participations.length} participation{participations.length > 1 ? "s" : ""}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="h-12 border-b border-border">
                                <th className="px-5 text-left text-xs font-medium text-muted-foreground">Chasse</th>
                                <th className="px-5 text-left text-xs font-medium text-muted-foreground">Statut</th>
                                <th className="px-5 text-left text-xs font-medium text-muted-foreground">Points</th>
                                <th className="px-5 text-left text-xs font-medium text-muted-foreground">Durée</th>
                                <th className="px-5 text-left text-xs font-medium text-muted-foreground">Étapes</th>
                                <th className="px-5 text-left text-xs font-medium text-muted-foreground">Indices</th>
                                <th className="px-5 text-left text-xs font-medium text-muted-foreground">Points perdus</th>
                                <th className="px-5 text-left text-xs font-medium text-muted-foreground">Début</th>
                                <th className="px-5 text-left text-xs font-medium text-muted-foreground">Fin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participations.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-5 py-10 text-center text-sm text-muted-foreground/70">
                                        Aucune participation
                                    </td>
                                </tr>
                            ) : (
                                participations.map((p) => {
                                    const stepsCompleted = p.progresses.filter(
                                        (pr) => pr.statut === "COMPLETED"
                                    ).length;
                                    const totalClues = p.progresses.reduce(
                                        (s, pr) => s + pr.clueUsages.length, 0
                                    );
                                    const pointsLost = p.progresses.reduce(
                                        (s, pr) =>
                                            s + pr.clueUsages.reduce(
                                                (ss, cu) => ss + cu.clue.penaltyCost, 0
                                            ),
                                        0
                                    );
                                    return (
                                        <tr key={p.id} className="h-16 border-b border-border last:border-0">
                                            <td className="px-5">
                                                <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                                                    {p.hunt.title}
                                                </p>
                                            </td>
                                            <td className="px-5">
                                                <StatusBadge status={p.status} />
                                            </td>
                                            <td className="px-5 text-sm font-semibold text-foreground">
                                                {p.totalPoints} pts
                                            </td>
                                            <td className="px-5 text-sm text-foreground/80">
                                                {formatDuration(p.startTime, p.endTime)}
                                            </td>
                                            <td className="px-5 text-sm text-foreground/80">
                                                {stepsCompleted} / {p.progresses.length}
                                            </td>
                                            <td className="px-5 text-sm text-foreground/80">
                                                {totalClues > 0 ? (
                                                    <span className="text-amber-600">{totalClues}</span>
                                                ) : (
                                                    <span className="text-muted-foreground/70">0</span>
                                                )}
                                            </td>
                                            <td className="px-5 text-sm">
                                                {pointsLost > 0 ? (
                                                    <span className="text-red-500">−{pointsLost} pts</span>
                                                ) : (
                                                    <span className="text-muted-foreground/70">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 text-sm text-muted-foreground">
                                                {new Date(p.startTime).toLocaleDateString("fr-FR")}
                                            </td>
                                            <td className="px-5 text-sm text-muted-foreground">
                                                {p.endTime
                                                    ? new Date(p.endTime).toLocaleDateString("fr-FR")
                                                    : "—"}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
