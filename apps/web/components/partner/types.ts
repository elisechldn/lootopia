import type { HuntModel, StepModel, ArItem, Clue } from "@repo/types";

export type Hunt = Pick<HuntModel, "id" | "title" | "shortDescription" | "description" | "status" | "rewardType" | "rewardValue" | "coverImage" > & {
    difficulty: string | null;
    latitude: number;
    longitude: number;
    startDate: string | null;
    endDate: string | null;
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

export type Step = Pick<StepModel, "orderNumber" | "title" | "radius" | "points"> & {
    id?: number;
    clues: Clue[];
    latitude?: number | null;
    longitude?: number | null;
    qrCode?: string | null;
    refArItem?: string | null;
    arItem?: ArItem | null;
    _arContentFile?: File | null;
    arItemFilename?: string | null;
    arMode?: "GPS" | "MARKER";
    _markerFile?: File | null;
    _markerPatternFile?: File | null;
    markerImageUrl?: string | null;
    markerPatternUrl?: string | null;
}
