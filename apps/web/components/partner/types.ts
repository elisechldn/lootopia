import type { HuntModel, StepModel } from "@repo/types";

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

export type Step = Pick<StepModel, "orderNumber" | "title" | "radius" | "actionType" | "points"> & {
    id?: number;
    clue: string;
    latitude?: number | null;
    longitude?: number | null;
    qrCode: string | null;
    // Transient: fichier .glb sélectionné, uploadé puis remplacé par refArItem.
    // Strippé avant l'envoi à l'API.
    _arContentFile?: File | null;
    refArItem?: string | null;
    arItemFilename?: string | null;
}
