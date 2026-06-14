'use client';

import { useEffect, useState, useTransition } from 'react';
import { getProgressCluesAction, revealClueAction, type CluePlayerData } from '@/lib/actions/clue.actions';
import HintBubbleItem from './HintBubbleItem';
import HintConfirmModal from './HintConfirmModal';
import HintContentModal from './HintContentModal';
import type { BubbleInfo, ContentClue } from './types';

interface Props {
  progressId: number;
  totalPoints: number;
  participationPoints: number;
  /** L'étape courante est la dernière de la chasse (adapte le CTA de la solution). */
  isLastStep: boolean;
  onProgressChanged: () => void;
}

export default function HintBubbles({ progressId, totalPoints, participationPoints, isLastStep, onProgressChanged }: Props) {
  const [data, setData] = useState<CluePlayerData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmBubble, setConfirmBubble] = useState<BubbleInfo | null>(null);
  const [contentClue, setContentClue] = useState<ContentClue | null>(null);
  const [currentPoints, setCurrentPoints] = useState(totalPoints);
  // Le dernier indice (solution) peut terminer la chasse côté parent. On diffère
  // le refresh parent à la fermeture de la modale de réponse pour qu'elle reste
  // visible avant la transition vers l'écran "Chasse terminée".
  const [refreshOnClose, setRefreshOnClose] = useState(false);

  const loadClues = () => {
    startTransition(async () => {
      try {
        const result = await getProgressCluesAction(progressId);
        setData(result);
      } catch {
        // indices optionnels — silencieux
      }
    });
  };

  useEffect(() => { loadClues(); }, [progressId]);

  if (!data || data.totalClues === 0) return null;

  const bubbles: BubbleInfo[] = Array.from({ length: data.totalClues }, (_, i) => {
    const orderNumber = i + 1;
    const isLast = orderNumber === data.totalClues;
    const revealed = data.revealedClues.find((c) => c.orderNumber === orderNumber);

    if (revealed) {
      return { orderNumber, state: 'USED', clueId: revealed.id, penaltyCost: revealed.penaltyCost, message: revealed.message, isLast };
    }
    if (data.nextClue && data.nextClue.orderNumber === orderNumber) {
      return { orderNumber, state: 'ENABLED', clueId: data.nextClue.id, penaltyCost: data.nextClue.penaltyCost, isLast };
    }
    return { orderNumber, state: 'DISABLED', clueId: null, penaltyCost: 0, isLast };
  });

  const handleBubbleClick = (bubble: BubbleInfo) => {
    if (bubble.state === 'DISABLED') return;
    if (bubble.state === 'USED') {
      setContentClue({ orderNumber: bubble.orderNumber, message: bubble.message!, penaltyCost: bubble.penaltyCost, isLast: bubble.isLast, isLastStep });
    }
    if (bubble.state === 'ENABLED') {
      setConfirmBubble(bubble);
    }
  };

  const handleConfirm = () => {
    if (!confirmBubble?.clueId) return;
    startTransition(async () => {
      try {
        const result = await revealClueAction(progressId, confirmBubble.clueId!);
        setConfirmBubble(null);
        setContentClue({
          orderNumber: result.clue.orderNumber,
          message: result.clue.message,
          penaltyCost: result.clue.penaltyCost,
          isLast: result.isLastClue,
          isLastStep,
        });
        setCurrentPoints((prev) => Math.max(0, prev - result.clue.penaltyCost));
        if (result.isLastClue) {
          // Solution révélée : refresh parent différé à la fermeture de la modale.
          setRefreshOnClose(true);
        } else {
          loadClues();
          onProgressChanged();
        }
      } catch {
        setConfirmBubble(null);
      }
    });
  };

  const handleContentClose = () => {
    setContentClue(null);
    if (refreshOnClose) {
      setRefreshOnClose(false);
      onProgressChanged();
    }
  };

  return (
    <>
      <div className="flex flex-row items-center gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <span className="shrink-0 rounded-full border border-border bg-card/90 px-2.5 py-0.5 text-sm font-black">
          Indices
        </span>
        <div className="flex flex-row items-center gap-1.5 p-1">
          {bubbles.map((bubble) => (
            <HintBubbleItem key={bubble.orderNumber} bubble={bubble} onClick={() => handleBubbleClick(bubble)} />
          ))}
        </div>
      </div>

      {confirmBubble && (
        <HintConfirmModal
          bubble={confirmBubble}
          totalPoints={currentPoints}
          participationPoints={participationPoints}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmBubble(null)}
          isPending={isPending}
        />
      )}

      {contentClue && (
        <HintContentModal clue={contentClue} onClose={handleContentClose} />
      )}
    </>
  );
}
