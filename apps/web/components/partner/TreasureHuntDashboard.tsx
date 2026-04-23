"use client";

import { Hunt, HuntStats } from "./types";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import { AlertTriangle, Download, Pencil, Plus, Eye, Trash2 } from "lucide-react";

interface Props {
    hunts: Hunt[];
    stats: HuntStats;
}

function mapStatus(status: Hunt["status"]): "Active" | "Inactive" | "Brouillon" {
    if (status === "ACTIVE") return "Active";
    if (status === "FINISHED") return "Inactive";
    return "Brouillon";
}

function StatusBadge({ status }: { status: Hunt["status"] }) {
    const mapped = mapStatus(status);
    const variants = {
        Active: "bg-green-50 text-green-700 border-green-200",
        Inactive: "bg-gray-50 text-gray-500 border-gray-200",
        Brouillon: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
    return (
        <Badge variant="outline" className={variants[mapped]}>
            {mapped}
        </Badge>
    );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
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

const ITEMS_PER_PAGE = 5;

export default function TreasureHuntDashboard({ hunts, stats }: Props) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [huntToDelete, setHuntToDelete] = useState<Hunt | null>(null);
    const [deleting, setDeleting] = useState(false);

    const filtered = hunts.filter((h) => {
        const matchSearch = h.title.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || h.status.toLowerCase() === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleDelete = async () => {
        if (!huntToDelete) return;
        setDeleting(true);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunts/${huntToDelete.id}`, {
                method: "DELETE",
            });
            router.refresh();
        } finally {
            setDeleting(false);
            setHuntToDelete(null);
        }
    };

    return (
        <div className="p-8 max-w-6xl">

            {/* Dialog de suppression */}
            <Dialog open={!!huntToDelete} onOpenChange={(open) => !open && setHuntToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <DialogTitle>Supprimer la chasse</DialogTitle>
                        </div>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer{" "}
                            <span className="font-medium text-gray-700">
                                &quot;{huntToDelete?.title}&quot;
                            </span>{" "}
                            ? Cette action est irréversible et supprimera également toutes
                            les étapes et participations associées.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setHuntToDelete(null)} disabled={deleting}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting ? "Suppression..." : "Supprimer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chasse au trésor</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Gérez vos expériences de chasse au trésor</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Link href="/dashboard/hunts/new">
                        <Button size="sm" className="gap-2 bg-gray-900 hover:bg-gray-800">
                            <Plus className="w-4 h-4" />
                            Create Hunt
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard label="Total de chasses" value={stats.total}
                          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/></svg>}
                />
                <StatCard label="Chasses actives" value={stats.active}
                          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/></svg>}
                />
                <StatCard label="Complétées" value={stats.finished}
                          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                />
                <StatCard label="Nombre total de joueurs" value={stats.players}
                          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>}
                />
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                             className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                        </svg>
                        <Input
                            placeholder="Recherche de chasses..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9 text-sm border-gray-200"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v!); setPage(1); }}>
                        <SelectTrigger className="w-40 text-sm">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="finished">Inactive</SelectItem>
                            <SelectItem value="draft">Brouillon</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50">
                    <h2 className="text-sm font-semibold text-gray-900">Liste des parcours</h2>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="h-12">
                            <TableHead className="px-5">Nom du parcours</TableHead>
                            <TableHead className="px-5">Statut</TableHead>
                            <TableHead className="px-5">Participants</TableHead>
                            <TableHead className="px-5">Créée le</TableHead>
                            <TableHead className="px-5">Modifiée le</TableHead>
                            <TableHead className="px-5">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginated.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-sm text-gray-400">
                                    Aucun parcours trouvé
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginated.map((hunt) => (
                                <TableRow key={hunt.id} className="h-16">
                                    <TableCell className="py-4 px-5 max-w-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600 shrink-0">
                                                {hunt.title.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{hunt.title}</p>
                                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                                    {hunt.shortDescription ?? hunt.description ?? ""}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-5">
                                        <StatusBadge status={hunt.status} />
                                    </TableCell>
                                    <TableCell className="py-4 px-5 text-sm text-gray-700">
                                        {hunt._count.participations}
                                    </TableCell>
                                    <TableCell className="py-4 px-5 text-sm text-gray-500">
                                        {new Date(hunt.createdAt).toLocaleDateString("fr-FR")}
                                    </TableCell>
                                    <TableCell className="py-4 px-5 text-sm text-gray-500">
                                        {new Date(hunt.updatedAt).toLocaleDateString("fr-FR")}
                                    </TableCell>
                                    <TableCell className="py-4 px-5">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-gray-700"
                                                    onClick={() => router.push(`/dashboard/hunts/${hunt.id}/edit`)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-gray-700">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-red-500"
                                                    onClick={() => setHuntToDelete(hunt)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-gray-50 flex items-center justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                            Précédent
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <Button key={p} variant={p === page ? "default" : "outline"} size="sm"
                                    onClick={() => setPage(p)} className="w-8 h-8 p-0">
                                {p}
                            </Button>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                            Suivant
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}