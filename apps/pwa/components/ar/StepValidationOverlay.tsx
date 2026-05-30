'use client';

import { CheckCircle, TriangleAlert } from 'lucide-react';
import HintModal from '@/components/game/hints/HintModal';

export type StepValidationResult = {
  success: boolean;
  message: string;
  points?: number;
};

type Props = {
  isValidating: boolean;
  result: StepValidationResult | null;
  onDismiss: () => void;
};

export default function StepValidationOverlay({ isValidating, result, onDismiss }: Props) {
  if (isValidating) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 50,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!result) return null;

  return (
    <HintModal onClose={onDismiss}>
      <div className="flex flex-col items-center gap-3 text-center">
        {result.success ? (
          <CheckCircle size={48} className="text-green-500" />
        ) : (
          <TriangleAlert size={48} className="text-amber-500" />
        )}
        <h2 className="text-lg font-bold">
          {result.success ? 'Étape validée !' : 'Impossible de valider'}
        </h2>
        {result.success && (result.points ?? 0) > 0 && (
          <p className="text-sm text-muted-foreground">+{result.points} points</p>
        )}
        {!result.success && (
          <p className="text-sm text-muted-foreground leading-relaxed">{result.message}</p>
        )}
        <button
          onClick={onDismiss}
          className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          OK
        </button>
      </div>
    </HintModal>
  );
}
