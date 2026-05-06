// filter-asignacion.dto.ts
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { EstadoAsignacion } from "../entities/asignacion.entity";

export class FilterAsignacionDto {

  @IsOptional()
  @IsEnum(EstadoAsignacion, { message: 'estado debe ser activa o finalizada' })
  estado_asignacion?: EstadoAsignacion;
  

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  ci_conductor?: number;

  @IsOptional()
  @IsString()
  placa_tracto?: string;

  @IsOptional()
  @IsString()
  placa_remolque?: string;
}