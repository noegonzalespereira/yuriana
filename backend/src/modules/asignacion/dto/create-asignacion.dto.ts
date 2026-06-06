import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Transform } from "class-transformer";

const toUpperTrim = ({ value }: { value: any }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value;

export class CreateAsignacionDto {

  @IsNumber({}, { message: 'El CI del conductor debe ser un número' })
  @Min(1)
  ci_conductor!: number;

  @IsString({ message: 'La placa del tracto debe ser texto' })
  @Transform(toUpperTrim)
  placa_tracto!: string;

  @IsString({ message: 'La placa del remolque debe ser texto' })
  @Transform(toUpperTrim)
  placa_remolque!: string;

}