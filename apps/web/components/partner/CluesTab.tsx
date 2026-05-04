"use client";

import { useCallback, useState } from "react";
import { Clue } from "@repo/types";
import ClueItem from "./ClueItem";

interface Props {
    stepIndex: number;
    clues: Partial<Clue>[];
    onChange: (stepIndex: number, clues: Partial<Clue>[]) => void;
}

export default function CluesTab({ stepIndex, clues, onChange }: Props) {
    const [newMessage, setNewMessage] = useState("");
    const [newPenalty, setNewPenalty] = useState(12);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = () => {
        if (!newMessage.trim()) return;
        setAdding(true);
        const newClue: Partial<Clue> = {
            message: newMessage,
            penaltyCost: newPenalty,
            orderNumber: clues.length + 1,
        };
        onChange(stepIndex, [...clues, newClue]);
        setNewMessage("");
        setAdding(false);
    };

    const handleUpdate = useCallback((index: number, message: string, penalty: number) => {
        const updated = clues.map((c, i) =>
            i === index ? { ...c, message, penaltyCost: penalty } : c
        );
        onChange(stepIndex, updated);
    }, [clues, stepIndex, onChange]);

    const handleDelete = useCallback((index: number) => {
        onChange(stepIndex, clues.filter((_, i) => i !== index));
    }, [clues, stepIndex, onChange]);

    return (
        <div className="space-y-3">
            {error && <p className="text-xs text-red-500">{error}</p>}

            {clues.map((clue, idx) => (
                <ClueItem
                    key={idx}
                    clue={clue}
                    index={idx}
                    isLast={idx === clues.length - 1 && clues.length > 0}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
            ))}

            <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Ajouter un indice</p>
                <div className="flex gap-2">
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                        placeholder="Texte de l'indice..."
                        className="flex-1 px-2 py-1 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <input
                        type="number"
                        value={newPenalty}
                        onChange={(e) => setNewPenalty(Number(e.target.value))}
                        className="w-20 px-2 py-1 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                        min={0}
                        title="Pénalité en points"
                        placeholder="pts"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={adding || !newMessage.trim()}
                        className="px-3 py-1 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                    >
                        {adding ? "..." : "+ Ajouter"}
                    </button>
                </div>
                <p className="text-xs text-muted-foreground/60">
                    Le champ numérique indique la pénalité en points (-N pts).
                </p>
            </div>
        </div>
    );
}
