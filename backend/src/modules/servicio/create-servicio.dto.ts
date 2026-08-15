import { Transform } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsIn } from 'class-validator';
import { Operador, Moneda } from '../servicio/entities/servicio.entity';

export class CreateServicioDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  id_categoria!: number;

  @IsEnum(Operador)
  operador!: Operador;

  @IsString()
  origen!: string;

  @IsString()
  destino!: string;

  @IsOptional()
  @IsString()
  crt?: string;

  @IsIn(['si', 'no'])
  es_facturado!: 'si' | 'no';

  @IsOptional()
  @IsString()
  factura_transporte?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  monto_factura?: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  id_cliente!: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  id_asignacion!: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  id_colaborador?: number;

  @IsEnum(Moneda)
  moneda!: Moneda;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  tipo_cambio?: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  flete!: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  flete_adicional?: number;

  @IsDateString()
  fecha_inicio!: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  periodo_liquidacion?: number;

  @IsOptional()
  @IsString()
  descripcion_carga?: string;
  
  @IsOptional()
  @IsString()
  ids_requisitos_aduaneros?: string;
}