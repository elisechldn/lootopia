"use client";

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Hunt {
    id: string;
    initials: string;
    name: string;
    subtitle: string;
    status: "Active" | "Inactive" | "Brouillon";
    participants: number;
    createdAt: string;
    updatedAt: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_HUNTS: Hunt[] = [
    {
        id: "1",
        initials: "QE",
        name: "Quête d'explorateur de la ville",
        subtitle: "Aventure au centre-ville",
        status: "Active",
        participants: 142,
        createdAt: "Jan 15, 2025",
        updatedAt: "Jan 20, 2025"
    },
    {
        id: "2",
        initials: "QE",
        name: "Quête d'explorateur de la ville",
        subtitle: "Aventure au centre-ville",
        status: "Active",
        participants: 142,
        createdAt: "Jan 15, 2025",
        updatedAt: "Jan 20, 2025"
    },
    {
        id: "3",
        initials: "QE",
        name: "Quête d'explorateur de la ville",
        subtitle: "Aventure au centre-ville",
        status: "Active",
        participants: 142,
        createdAt: "Jan 15, 2025",
        updatedAt: "Jan 20, 2025"
    },
    {
        id: "4",
        initials: "QE",
        name: "Quête d'explorateur de la ville",
        subtitle: "Aventure au centre-ville",
        status: "Active",
        participants: 142,
        createdAt: "Jan 15, 2025",
        updatedAt: "Jan 20, 2025"
    },
];

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({label, value, icon}: { label: string; value: string | number; icon: React.ReactNode }) {
    return (
        <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
            </div>
            <div className="text-gray-400">{icon}</div>
        </div>
    );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({status}: { status: Hunt["status"] }) {
    const styles: Record<Hunt["status"], string> = {
        Active: "bg-green-50 text-green-700 border-green-100",
        Inactive: "bg-gray-50 text-gray-500 border-gray-100",
        Brouillon: "bg-yellow-50 text-yellow-700 border-yellow-100",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
            {status}
        </span>
    );
}

// ─── Action buttons ───────────────────────────────────────────────────────────

function ActionButtons({onEdit, onView, onDelete}: { onEdit: () => void; onView: () => void; onDelete: () => void }) {
    return (
        <div className="flex items-center gap-2">
            <button onClick={onEdit} className="text-gray-400 hover:text-gray-700 transition-colors" title="Modifier">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
                </svg>
            </button>
            <button onClick={onView} className="text-gray-400 hover:text-gray-700 transition-colors" title="Consulter">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
            </button>
            <button onClick={onDelete} className="text-gray-400 hover:text-red-500 transition-colors" title="Supprimer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                </svg>
            </button>
        </div>
    );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 4;

export default function TreasureHuntDashboard() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [page, setPage] = useState(1);

    const filtered = MOCK_HUNTS.filter((h) => {
        const matchSearch = h.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || h.status.toLowerCase() === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <div className="p-8 max-w-6xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chasse au trésor</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Gérez vos expériences de chasse au trésor</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 text-gray-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                             className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                        </svg>
                        Export
                    </Button>
                    <Button size="sm" className="gap-2 bg-gray-900 hover:bg-gray-800 text-white">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                        </svg>
                        Create Hunt
                    </Button>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="Total de chasses"
                    value={24}
                    icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                             className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/>
                        </svg>
                    }
                />
                <StatCard
                    label="Chasses actives"
                    value={8}
                    icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                             className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/>
                        </svg>
                    }
                />
                <StatCard
                    label="Complétées"
                    value={12}
                    icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                             className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                        </svg>
                    }
                />
                <StatCard
                    label="Nombre total de joueurs"
                    value={1247}
                    icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                             className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
                        </svg>
                    }
                />
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 mb-4">
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                             className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                        </svg>
                        <Input
                            placeholder="Recherche de chasses..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="pl-9 text-sm border-gray-200"
                        />
                    </div>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                        <option value="all">Statut</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Brouillon</option>
                    </select>

                    {/* Category filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setPage(1);
                        }}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                        <option value="all">Toutes les catégories</option>
                        <option value="urban">Urbaine</option>
                        <option value="nature">Nature</option>
                        <option value="museum">Musée</option>
                    </select>

                    {/* Sort/filter icons */}
                    <div className="ml-auto flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                                 className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"/>
                            </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                                 className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50">
                    <h2 className="text-sm font-semibold text-gray-900">Liste des parcours</h2>
                </div>

                <table className="w-full">
                    <thead>
                    <tr className="border-b border-gray-50">
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Nom du parcours</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Statut</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Nombre de participants
                        </th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">date de création</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">dernière modification</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginated.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                                Aucun parcours trouvé
                            </td>
                        </tr>
                    ) : (
                        paginated.map((hunt) => (
                            <tr key={hunt.id}
                                className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                {/* Name */}
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600 shrink-0">
                                            {hunt.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{hunt.name}</p>
                                            <p className="text-xs text-gray-400">{hunt.subtitle}</p>
                                        </div>
                                    </div>
                                </td>
                                {/* Status */}
                                <td className="px-5 py-3">
                                    <StatusBadge status={hunt.status}/>
                                </td>
                                {/* Participants */}
                                <td className="px-5 py-3 text-sm text-gray-700">
                                    {hunt.participants}
                                </td>
                                {/* Created */}
                                <td className="px-5 py-3 text-sm text-gray-500">
                                    {hunt.createdAt}
                                </td>
                                {/* Updated */}
                                <td className="px-5 py-3 text-sm text-gray-500">
                                    {hunt.updatedAt}
                                </td>
                                {/* Actions */}
                                <td className="px-5 py-3">
                                    <ActionButtons
                                        onEdit={() => console.log("edit", hunt.id)}
                                        onView={() => console.log("view", hunt.id)}
                                        onDelete={() => console.log("delete", hunt.id)}
                                    />
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-gray-50 flex items-center justify-end gap-1">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Précédent
                        </button>
                        {Array.from({length: totalPages}, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${
                                    p === page
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-600 border border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Suivant
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}