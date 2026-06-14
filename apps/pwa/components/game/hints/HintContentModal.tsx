'use client';

import { CheckCircle, Star, ShieldAlert } from 'lucide-react';
import HintModal from './HintModal';
import type { ContentClue } from './types';

interface Props {
  clue: ContentClue;
  onClose: () => void;
}

export default function HintContentModal({ clue, onClose }: Props) {
  const isSolution = clue.isLast;

  return (
    <HintModal onClose={onClose}>
      {/* Header row */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
          isSolution ? 'bg-red-500/10 border-red-200/25' : 'bg-green-500/15 border-green-200/25',
        ].join(' ')}>
          {isSolution
            ? <Star size={18} className="stroke-red-500" fill="none" />
            : <CheckCircle size={18} className="stroke-green-500" fill="none" />
          }
        </div>
        <div>
          <p className="mb-0.5 text-xs font-semibold text-muted-foreground">
            {isSolution ? '🏁 Solution' : `💡 Indice ${clue.orderNumber}`}
          </p>
          <p className="text-[15px] font-bold text-foreground">
            {isSolution ? 'Réponse révélée' : 'Un petit coup de pouce'}
          </p>
        </div>
      </div>

      {/* Clue text */}
      <div className="mb-3 rounded-xl border border-border bg-muted px-4 py-3.5">
        <p className="m-0 text-sm italic leading-5.5 text-foreground">
          {clue.message}
        </p>
      </div>

      {/* Penalty reminder */}
      <div className="mb-5 flex items-center gap-1.5">
        <ShieldAlert size={13} className={isSolution ? 'stroke-red-500' : 'stroke-orange-500'} />
        <span className={['text-xs font-semibold', isSolution ? 'text-red-500' : 'text-orange-500'].join(' ')}>
          {isSolution ? "Score de l'étape → 0 pts" : `Pénalité appliquée : −${clue.penaltyCost} pts`}
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={onClose}
        className="h-12 w-full rounded-3xl bg-green-500 text-sm font-bold text-white active:opacity-90"
      >
        {isSolution
          ? clue.isLastStep
            ? '🏁 Terminer la chasse'
            : "✓ Passer à l'étape suivante"
          : "OK, j'ai compris !"}
      </button>
    </HintModal>
  );
}
