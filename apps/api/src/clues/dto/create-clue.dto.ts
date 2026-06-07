import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateClueDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  penaltyCost?: number;
}
