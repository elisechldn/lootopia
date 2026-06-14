export type BubbleState = 'USED' | 'ENABLED' | 'DISABLED';

export interface BubbleInfo {
  orderNumber: number;
  state: BubbleState;
  clueId: number | null;
  penaltyCost: number;
  message?: string;
  isLast: boolean;
}

export interface ContentClue {
  orderNumber: number;
  message: string;
  penaltyCost: number;
  /** Dernier indice de l'étape (= solution). */
  isLast: boolean;
  /** L'étape courante est la dernière de la chasse (CTA "Terminer la chasse"). */
  isLastStep: boolean;
}
