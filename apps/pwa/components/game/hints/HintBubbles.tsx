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
  onProgressChanged: () => void;
}

export default function HintBubbles({ progressId, totalPoints, onProgressChanged }: Props) {
  const [data, setData] = useState<CluePlayerData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmBubble, setConfirmBubble] = useState<BubbleInfo | null>(null);
  const [contentClue, setContentClue] = useState<ContentClue | null>(null);
  const [currentPoints, setCurrentPoints] = useState(totalPoints);

  const loadClues = () => {
    startTransition(async () => {
      try {
        const result = await getProgressCluesAction(progressId);
        console.log("RESULT -> ", result)
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
      setContentClue({ orderNumber: bubble.orderNumber, message: bubble.message!, penaltyCost: bubble.penaltyCost, isLast: bubble.isLast });
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
        });
        if (result.isLastClue) {
          onProgressChanged();
        } else {
          setCurrentPoints((prev) => Math.max(0, prev - result.clue.penaltyCost));
          loadClues();
        }
      } catch {
        setConfirmBubble(null);
      }
    });
  };

  return (
    <>
      <div className="flex flex-row items-center gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <span className="shrink-0 rounded-full border border-gray-200 bg-white/90 px-2.5 py-0.5 text-sm font-black">
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
          onConfirm={handleConfirm}
          onCancel={() => setConfirmBubble(null)}
          isPending={isPending}
        />
      )}

      {contentClue && (
        <HintContentModal clue={contentClue} onClose={() => setContentClue(null)} />
      )}
    </>
  );
}
