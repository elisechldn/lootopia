export interface NextClueInfo {
  id: number;
  orderNumber: number;
  penaltyCost: number;
}

export interface RevealedClueInfo {
  id: number;
  orderNumber: number;
  message: string;
  penaltyCost: number;
}

export interface PlayerCluesResponse {
  totalClues: number;
  revealedCount: number;
  nextClue: NextClueInfo | null;
  revealedClues: RevealedClueInfo[];
}

export interface RevealClueResponse {
  clue: {
    id: number;
    message: string;
    penaltyCost: number;
    orderNumber: number;
  };
  isLastClue: boolean;
  alreadyRevealed: boolean;
}
