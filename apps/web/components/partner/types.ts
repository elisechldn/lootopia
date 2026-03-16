export interface Hunt {
    id: number;
    title: string;
    shortDescription: string | null;
    description: string | null;
    difficulty: string | null;
    status: 'DRAFT' | 'ACTIVE' | 'FINISHED';
    startDate: string | null;
    endDate: string | null;
    location: string | null;
    rewardType: string | null;
    rewardValue: string | null;
    createdAt: string;
    updatedAt: string;
    _count: { participations: number };
    steps?: Step[];
}

export interface HuntStats {
    total: number;
    active: number;
    finished: number;
    players: number;
}

export type ActionType = 'GPS' | 'QR_CODE' | 'AR' | 'RIDDLE';

export interface Step {
    id?: number;
    orderNumber: number;
    title: string;
    clue: string;
    latitude?: number | null;
    longitude?: number | null;
    radius: number;
    actionType: ActionType;
    arMarker: string | null;
    arContent: string | null;
    qrCode: string | null;
    points: number;
}