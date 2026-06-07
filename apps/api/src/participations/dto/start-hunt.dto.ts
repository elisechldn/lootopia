import { IsInt, Min } from 'class-validator';

export class StartHuntDto {
  @IsInt()
  @Min(1)
  huntId: number;
}
