import { PartialType } from '@nestjs/mapped-types';
import { CreateServicioDto } from './create-servicio.dto';
import { IsOptional, IsDateString, IsNumber } from 'class-validator';

export class UpdateServicioDto extends PartialType(CreateServicioDto) {
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsNumber()
  periodo_liquidacion?: number;
}