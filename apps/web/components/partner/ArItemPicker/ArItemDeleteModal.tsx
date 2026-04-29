"use client";

interface ArItemDeleteModalProps {
  filename: string;
  stepsCount: number;
  huntsCount: number;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ArItemDeleteModal({
  filename,
  stepsCount,
  huntsCount,
  onConfirm,
  onClose,
}: ArItemDeleteModalProps) {
  const isBlocked = stepsCount > 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <h2 className="text-base font-semibold text-foreground mb-2">
          {isBlocked ? "Suppression impossible" : "Supprimer cet asset ?"}
        </h2>
        <p className="text-sm text-muted-foreground mb-1">
          <span className="font-medium text-foreground">{filename}</span>
        </p>
        {isBlocked ? (
          <p className="text-sm text-muted-foreground mb-5">
            Ce modèle AR est utilisé dans{" "}
            <strong>{stepsCount} étape{stepsCount > 1 ? "s" : ""}</strong> de{" "}
            <strong>{huntsCount} chasse{huntsCount > 1 ? "s" : ""}</strong>. Suppression impossible.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mb-5">
            Cette action est irréversible.
          </p>
        )}
        <div className="flex gap-2 justify-end">
          {!isBlocked && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Supprimer
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground/80 bg-muted border border-border rounded-lg hover:bg-muted/70 transition-colors"
          >
            {isBlocked ? "Fermer" : "Annuler"}
          </button>
        </div>
      </div>
    </div>
  );
}
