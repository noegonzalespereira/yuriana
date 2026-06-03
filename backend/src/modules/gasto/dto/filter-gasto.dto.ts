import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { TipoPestaña } from './create-gasto-bulk.dto';

export class FilterGastoDto {
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  buscar?: string;

  @IsOptional()
  @IsString()
  tipo_gasto?: string;
}