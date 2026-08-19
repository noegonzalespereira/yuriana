import { IsEnum, IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { EstadoPago, EstadoServicio, Operador } from '../entities/servicio.entity';

export class FilterServicioDto {
  @IsOptional()
  @IsString()
  buscar?: string;

  @IsOptional()
  @IsEnum(Operador)
  operador?: Operador;

  @IsOptional()
  @IsEnum(EstadoPago)
  estado_pago?: EstadoPago;

  @IsOptional()
  @IsEnum(EstadoServicio)
  estado_servicio?: EstadoServicio;

  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  id_categoria?: number;

  @IsOptional()
  @IsString()
  facturado?: 'si' | 'no';
  
}