import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEmbarqueDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => String(value).trim().toUpperCase())
  crt!: string;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  total_unidades!: number;
}