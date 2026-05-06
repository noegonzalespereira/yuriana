// create-asignacion.dto.ts
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateAsignacionDto {

  @IsNumber({}, { message: 'El CI del conductor debe ser un número' })
  @Min(1)
  ci_conductor!: number;

  @IsString({ message: 'La placa del tracto debe ser texto' })
  placa_tracto!: string;


  @IsString({ message: 'La placa del remolque debe ser texto' })
  placa_remolque!: string;


}