import { HuntStatus } from '../../orm/prisma/generated/enums';

export class CreateHuntDto {
    title: string;
    shortDescription?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    radius?: number;
    difficulty?: string;
    status?: HuntStatus;
    rewardType?: string;
    rewardValue?: string;
    refUser: number;
}