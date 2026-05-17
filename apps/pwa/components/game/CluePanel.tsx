'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  getProgressCluesAction,
  revealClueAction,
  type CluePlayerData,
} from '@/lib/actions/clue.actions';

interface Props {
  progressId: number;
  onProgressChanged: () => void;
  onClose: () => void;
}

export default function CluePanel({
  progressId,
  onProgressChanged,
  onClose,
}: Props) {
  const [data, setData] = useState<CluePlayerData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmLastClue, setConfirmLastClue] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClues = () => {
    startTransition(async () => {
      try {
        const result = await getProgressCluesAction(progressId);
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Impossible de charger les indices',
        );
      }
    });
  };

  useEffect(() => {
    loadClues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressId]);

  const handleReveal = (clueId: number, isLast: boolean) => {
    if (isLast && !confirmLastClue) {
      setConfirmLastClue(true);
      return;
    }
    startTransition(async () => {
      try {
        await revealClueAction(progressId, clueId);
        if (isLast) {
          onProgressChanged();
        } else {
          loadClues();
        }
        setConfirmLastClue(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erreur lors de la révélation',
        );
      }
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          💡 Indices{data ? ` (${data.revealedCount}/${data.totalClues} révélés)` : ''}
        </p>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      {isPending && !data && (
        <p className="text-xs text-muted-foreground">Chargement...</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {data && (
        <>
          {/* Indices déjà révélés */}
          {data.revealedClues.map((clue) => (
            <div
              key={clue.id}
              className="rounded-lg border border-border bg-muted/30 px-3 py-2 space-y-0.5"
            >
              <p className="text-xs text-muted-foreground">
                Indice {clue.orderNumber} (−{clue.penaltyCost} pts)
              </p>
              <p className="text-sm">{clue.message}</p>
            </div>
          ))}

          {/* Prochain indice disponible */}
          {data.nextClue ? (
            <div className="space-y-2">
              {/* Avertissement dernier indice */}
              {confirmLastClue && (
                <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 px-3 py-3 space-y-2">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    ⚠️ Ce dernier indice révèle la solution et annule tous vos
                    points sur cette étape.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReveal(data.nextClue!.id, true)}
                      disabled={isPending}
                      className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => setConfirmLastClue(false)}
                      className="flex-1 rounded-lg border border-border py-2 text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {!confirmLastClue && (
                <button
                  onClick={() =>
                    handleReveal(
                      data.nextClue!.id,
                      data.nextClue!.orderNumber === data.totalClues,
                    )
                  }
                  disabled={isPending}
                  className="w-full rounded-xl border border-amber-400 bg-amber-50 dark:bg-amber-950/20 py-3 text-sm font-medium text-amber-700 dark:text-amber-300 disabled:opacity-50"
                >
                  {isPending
                    ? 'Révélation...'
                    : `Révéler l'indice ${data.nextClue.orderNumber} (−${data.nextClue.penaltyCost} pts)`}
                  {data.nextClue.orderNumber === data.totalClues && (
                    <span className="block text-xs mt-0.5 opacity-75">
                      ⚠️ Dernier indice — annule les points
                    </span>
                  )}
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-1">
              Tous les indices ont été révélés.
            </p>
          )}
        </>
      )}
    </div>
  );
}
