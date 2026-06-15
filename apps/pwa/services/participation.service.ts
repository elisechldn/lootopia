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
  radius: number;
  points: number;
  arMode: 'GPS' | 'MARKER';
  markerImageUrl: string | null;
  markerPatternUrl: string | null;
  arItem?: { id: string; filepath: string; filename: string; hasAnimations: boolean } | null;
  /** Coordonnées projetées par l'API (PostGIS) — requises pour le géofence. */
  latitude: number | null;
  longitude: number | null;
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

/** Chasse telle que renvoyée dans une participation (gameplay : steps + coords). */
export type GameHunt = NonNullable<GameParticipation['hunt']>;

export type LeaderboardEntry = {
  id: number;
  /** Score final (base + bonus de temps), base du tri du classement. */
  totalPoints: number;
  startTime: string;
  endTime: string;
  user: { id: number; firstname: string; lastname: string };
};
