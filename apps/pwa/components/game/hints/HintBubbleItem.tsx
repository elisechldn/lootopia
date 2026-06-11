'use client';

import { CheckCircle, Info, Star, Lock } from 'lucide-react';
import type { BubbleInfo } from './types';

interface Props {
  bubble: BubbleInfo;
  onClick: () => void;
}

export default function HintBubbleItem({ bubble, onClick }: Props) {
  const isUsed = bubble.state === 'USED';
  const isEnabled = bubble.state === 'ENABLED';
  const isDisabled = bubble.state === 'DISABLED';

  return (
    <div
      onClick={onClick}
      className={[
        'relative flex h-11 w-11 shrink-0 self-end items-center justify-center rounded-full',
        isUsed     && 'bg-green-500/15 border-2 border-green-500 cursor-pointer',
        isEnabled  && 'bg-orange-500/10 border-[2.5px] border-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.2)] cursor-pointer',
        isDisabled && 'bg-muted border-2 border-border opacity-50 cursor-default',
      ].filter(Boolean).join(' ')}
    >
      <div className="absolute -top-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-card text-[9px] font-bold leading-none text-foreground">
        {bubble.orderNumber}
      </div>

      {isUsed    && <CheckCircle size={18} className="stroke-green-500" fill="none" />}
      {isEnabled && (bubble.isLast
        ? <Star size={18} className="stroke-orange-500" fill="none" />
        : <Info size={18} className="stroke-orange-500" fill="none" />
      )}
      {isDisabled && <Lock size={18} className="stroke-muted-foreground" fill="none" />}
    </div>
  );
}
