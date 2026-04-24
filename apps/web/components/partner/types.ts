import type { HuntModel, StepModel } from "@repo/types";

export type Hunt = Pick<HuntModel, "id" | "title" | "shortDescription" | "description" | "status" | "rewardType" | "rewardValue" > & {
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

export type Step = Pick<StepModel, "orderNumber" | "title" | "radius" | "actionType" | "arContent" | "points"> & {
    id?: number;
    clue: string;
    latitude?: number | null;
    longitude?: number | null;
    arMarker: string | null;
    qrCode: string | null;
}
