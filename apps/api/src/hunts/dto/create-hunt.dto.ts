import { HuntStatus } from '@repo/types';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateHuntDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  locationLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  locationLon?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  radius?: number;

  @IsOptional()
  @IsEnum(HuntStatus)
  status?: HuntStatus;

  @IsOptional()
  @IsString()
  rewardType?: string;

  @IsOptional()
  @IsString()
  rewardValue?: string;

  @IsOptional()
  @IsString()
  coverImage?: string | null;

  @IsInt()
  @Min(1)
  refUser: number;
}
