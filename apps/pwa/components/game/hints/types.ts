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
  isLast: boolean;
}
