"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface Props {
  participationId: number;
  playerName: string;
  huntTitle: string;
  onDeleted: () => void;
}

export default function DeleteParticipationButton({
  participationId,
  playerName,
  huntTitle,
  onDeleted,
}: Props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/participations/${participationId}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? "Erreur lors de la suppression");
      }
      setOpen(false);
      onDeleted();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        aria-label="Supprimer la participation"
      >
        <Trash2 size={16} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer cette participation ?</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de supprimer la participation de{" "}
            <strong>{playerName}</strong> à la chasse{" "}
            <strong>{huntTitle}</strong>. Cette action est irréversible. Les
            progressions et usages d&apos;indices associés seront également
            supprimés.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive px-1">{error}</p>
        )}
        <DialogFooter>
          <DialogClose
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
            disabled={deleting}
          >
            Annuler
          </DialogClose>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
          >
            {deleting && <Loader2 size={14} className="animate-spin" />}
            Supprimer
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
