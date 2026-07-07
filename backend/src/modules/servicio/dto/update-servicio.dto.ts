import { PartialType } from '@nestjs/mapped-types';
import { CreateServicioDto } from './create-servicio.dto';
import { IsOptional, IsDateString, IsNumber, IsString, IsBooleanString } from 'class-validator';

export class UpdateServicioDto extends PartialType(CreateServicioDto) {
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  // Señal explícita para revertir un viaje finalizado a EN_CURSO (borra fecha_fin)
  @IsOptional()
  @IsBooleanString()
  borrar_fecha_fin?: string;

  @IsOptional()
  @IsNumber()
  periodo_liquidacion?: number;

  @IsOptional()
  @IsString()
  ids_fotos_eliminar?: string;
}