import { PartialType } from '@nestjs/mapped-types';
import { CreateServicioDto } from './create-servicio.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateServicioDto extends PartialType(CreateServicioDto) {
  @IsOptional()
  @IsString()
  borrar_fecha_fin?: string;

  @IsOptional()
  @IsString()
  ids_fotos_eliminar?: string;
}