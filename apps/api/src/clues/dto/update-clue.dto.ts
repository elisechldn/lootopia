import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateClueDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  penaltyCost?: number;
}
