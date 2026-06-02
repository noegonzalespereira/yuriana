// filter-asignacion.dto.ts
import { IsEnum, IsOptional, IsString } from "class-validator";
import { EstadoAsignacion } from "../entities/asignacion.entity";

export class FilterAsignacionDto {

  @IsOptional()
  @IsEnum(EstadoAsignacion, { message: 'estado debe ser activa o asignado' })
  estado_asignacion?: EstadoAsignacion;
  

  @IsOptional()
  @IsString()
  ci_conductor?: string;

  @IsOptional()
  @IsString()
  placa_tracto?: string;

  @IsOptional()
  @IsString()
  placa_remolque?: string;
}