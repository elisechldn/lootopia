"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Participant {
    id: number;
    status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
    totalPoints: number;
    startTime: string;
    endTime: string | null;
    user: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
    };
    hunt: {
        id: number;
        title: string;
        rewardType: string | null;
        rewardValue: string | null;
    };
}

interface Props {
    data: Participant[];
}

function StatusBadge({ status }: { status: Participant["status"] }) {
    const variants: Record<Participant["status"], string> = {
        COMPLETED: "bg-green-50 text-green-700 border-green-200",
        IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
        ABANDONED: "bg-red-50 text-red-500 border-red-200",
    };
    const labels: Record<Participant["status"], string> = {
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

export default function ParticipantsDashboard({ data }: Props) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filtered = data.filter(p => {
        const name = `${p.user.firstname} ${p.user.lastname} ${p.user.email} ${p.hunt.title}`.toLowerCase();
        const matchSearch = name.includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-4">

            {/* Filtres */}
            <div className="bg-card border border-border rounded-xl px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                             className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                        </svg>
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher un joueur ou une chasse..."
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-card"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="IN_PROGRESS">En cours</option>
                        <option value="COMPLETED">Terminé</option>
                        <option value="ABANDONED">Abandonné</option>
                    </select>
                </div>
            </div>

            {/* Tableau */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Liste des participants</h2>
                    <span className="text-xs text-muted-foreground/70">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="h-12 border-b border-border">
                            <th className="px-5 text-left text-xs font-medium text-muted-foreground">Joueur</th>
                            <th className="px-5 text-left text-xs font-medium text-muted-foreground">Chasse</th>
                            <th className="px-5 text-left text-xs font-medium text-muted-foreground">Statut</th>
                            <th className="px-5 text-left text-xs font-medium text-muted-foreground">Points</th>
                            <th className="px-5 text-left text-xs font-medium text-muted-foreground">Récompense</th>
                            <th className="px-5 text-left text-xs font-medium text-muted-foreground">Début</th>
                            <th className="px-5 text-left text-xs font-medium text-muted-foreground">Fin</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground/70">
                                    Aucun participant trouvé
                                </td>
                            </tr>
                        ) : (
                            filtered.map(p => (
                                <tr key={p.id} className="h-16 border-b border-border last:border-0">
                                    <td className="px-5">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {p.user.firstname} {p.user.lastname}
                                            </p>
                                            <p className="text-xs text-muted-foreground/70">{p.user.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-5">
                                        <p className="text-sm text-foreground/80 truncate max-w-[160px]">
                                            {p.hunt.title}
                                        </p>
                                    </td>
                                    <td className="px-5">
                                        <StatusBadge status={p.status} />
                                    </td>
                                    <td className="px-5 text-sm text-foreground/80">
                                        {p.totalPoints} pts
                                    </td>
                                    <td className="px-5">
                                        {p.status === "COMPLETED" && p.hunt.rewardValue ? (
                                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                    {p.hunt.rewardValue}
                                                </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground/70">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 text-sm text-muted-foreground">
                                        {new Date(p.startTime).toLocaleDateString("fr-FR")}
                                    </td>
                                    <td className="px-5 text-sm text-muted-foreground">
                                        {p.endTime
                                            ? new Date(p.endTime).toLocaleDateString("fr-FR")
                                            : "—"
                                        }
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