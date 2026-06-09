'use client';

import { Info, Star, ShieldAlert } from 'lucide-react';
import HintModal from './HintModal';
import type { BubbleInfo } from './types';

interface Props {
  bubble: BubbleInfo;
  totalPoints: number;
  participationPoints: number;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function HintConfirmModal({ bubble, totalPoints, participationPoints, onConfirm, onCancel, isPending }: Props) {
  const isSolution = bubble.isLast;

  return (
    <HintModal onClose={onCancel}>
      {/* Icon */}
      <div className={[
        'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2',
        isSolution ? 'bg-red-500/10 border-red-200/25' : 'bg-orange-500/10 border-orange-200/25',
      ].join(' ')}>
        {isSolution
          ? <Star size={26} className="stroke-red-500" fill="none" />
          : <Info size={26} className="stroke-orange-500" fill="none" />
        }
      </div>

      {/* Title */}
      <p className="mb-2 text-center text-[17px] font-bold text-foreground">
        {isSolution ? 'Révéler la solution ?' : `Utiliser l'indice ${bubble.orderNumber} ?`}
      </p>

      {/* Description */}
      <p className="mb-3.5 text-center text-[13px] leading-5 text-muted-foreground">
        {isSolution ? (
          <>Cette action <span className="font-bold text-red-500">réinitialise vos points</span> sur cette étape et passe automatiquement à l&apos;étape suivante.</>
        ) : (
          <>Cette action vous coûtera <span className="font-bold text-orange-500">−{bubble.penaltyCost} points</span> sur cette étape.</>
        )}
      </p>

      {/* Cost banner */}
      <div className={['mb-5 flex items-center gap-2 rounded-[10px] px-3.5 py-2.5', isSolution ? 'bg-red-500/10' : 'bg-orange-500/10'].join(' ')}>
        <ShieldAlert size={16} className={isSolution ? 'stroke-red-500' : 'stroke-orange-500'} />
        <span className={['text-xs font-semibold', isSolution ? 'text-red-500' : 'text-orange-500'].join(' ')}>
          {isSolution ? '−∞ pts' : `−${bubble.penaltyCost} pts`}
        </span>
        <span className="ml-auto text-[11px] text-muted-foreground">Score actuel : {participationPoints} pts</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-2.5">
        <button
          onClick={onCancel}
          className="h-12 flex-1 rounded-3xl border border-border bg-card text-sm font-semibold text-foreground active:bg-muted"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={isPending}
          className={['h-12 flex-1 rounded-3xl text-sm font-semibold text-white disabled:opacity-70 active:opacity-90', isSolution ? 'bg-red-500' : 'bg-orange-500'].join(' ')}
        >
          {isPending ? '…' : isSolution ? 'Révéler' : 'Utiliser'}
        </button>
      </div>
    </HintModal>
  );
}
