export type GameProgress = {
  id: number;
  statut: 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  refStep: number;
  totalPoints: number;
  /** Bonus de temps de cette étape, figé à sa validation. */
  timeBonus: number;
  completedAt: string | null;
};

export type GameStep = {
  id: number;
  orderNumber: number;
  title: string;
  arMode: 'GPS' | 'MARKER';
  markerImageUrl: string | null;
  markerPatternUrl: string | null;
  arItem?: { id: string; filepath: string; filename: string; hasAnimations: boolean } | null;
};

export type GameParticipation = {
  id: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  /** Score final (base + bonus de temps), figé à la dernière étape. */
  totalPoints: number;
  progresses: GameProgress[];
  hunt?: {
    id: number;
    title: string;
    steps: GameStep[];
  };
};

export type LeaderboardEntry = {
  id: number;
  /** Score final (base + bonus de temps), base du tri du classement. */
  totalPoints: number;
  startTime: string;
  endTime: string;
  user: { id: number; firstname: string; lastname: string };
};
