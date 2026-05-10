import { HuntStatus } from '@repo/types';

export class CreateHuntDto {
  title: string;
  shortDescription?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  locationLat?: number;
  locationLon?: number;
  radius?: number;
  status?: HuntStatus;
  rewardType?: string;
  rewardValue?: string;
  refUser: number;
}