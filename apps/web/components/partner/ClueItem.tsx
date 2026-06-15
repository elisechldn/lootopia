"use client";

import { memo, useState } from "react";
import { Clue } from "@repo/types";

interface Props {
    clue: Partial<Clue>;
    index: number;
    isLast: boolean;
    onUpdate: (index: number, message: string, penalty: number) => void;
    onDelete: (index: number) => void;
}

const ClueItem = memo(function ClueItem({ clue, index, isLast, onUpdate, onDelete }: Props) {
    const [editing, setEditing] = useState(false);
    const [editMessage, setEditMessage] = useState("");
    const [editPenalty, setEditPenalty] = useState(0);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const startEdit = () => {
        setEditMessage(clue.message ?? "");
        setEditPenalty(clue.penaltyCost ?? 0);
        setEditing(true);
    };

    const saveEdit = () => {
        onUpdate(index, editMessage, editPenalty);
        setEditing(false);
    };

    return (
        <div
            className={`rounded-lg border p-3 space-y-2 ${
                isLast
                    ? "border-red-300 bg-amber-50 dark:bg-amber-950/20"
                    : "border-border bg-card"
            }`}
        >
            {isLast && (
                <p className="text-xs font-black text-red-800">
                    Attention : L&apos;utilisation du dernier indice révèle la solution et annule les points de cette étape
                </p>
            )}

            {editing ? (
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <input
                            value={editMessage}
                            onChange={(e) => setEditMessage(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                        <input
                            type="number"
                            value={editPenalty}
                            onChange={(e) => setEditPenalty(Number(e.target.value))}
                            className="w-20 px-2 py-1 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                            min={0}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={saveEdit}
                            className="px-3 py-1 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                        >
                            Enregistrer
                        </button>
                        <button
                            onClick={() => setEditing(false)}
                            className="px-3 py-1 text-xs text-muted-foreground border border-border rounded-lg hover:bg-muted/50"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4 shrink-0">
                        {clue.orderNumber}.
                    </span>
                    <span className="flex-1 text-sm">{clue.message}</span>
                    <span className="text-md font-extrabold text-muted-foreground shrink-0">
                        -{clue.penaltyCost} pts
                    </span>
                    <span>|</span>
                    <button
                        onClick={startEdit}
                        className="text-xs font-black text-muted-foreground/70 hover:text-foreground transition-colors shrink-0"
                        title="Modifier"
                    >
                        Modifier
                    </button>
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="text-xl text-muted-foreground/70 hover:text-foreground transition-colors shrink-0"
                        title="Supprimer"
                    >
                        ╳
                    </button>
                </div>
            )}

            {confirmDelete && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                    <span>Supprimer cet indice ?</span>
                    <button
                        onClick={() => { onDelete(index); setConfirmDelete(false); }}
                        className="font-medium underline"
                    >
                        Oui
                    </button>
                    <button onClick={() => setConfirmDelete(false)}>Non</button>
                </div>
            )}
        </div>
    );
});

export default ClueItem;
