import { IsEnum,IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { Moneda, Operador } from '../entities/servicio.entity';
import { Transform } from 'class-transformer';

export class CreateServicioDto {

  @IsNotEmpty({ message: 'El operador es obligatorio'})
  @IsEnum(Operador, { message: 'El operador debe ser yuriana u otros' })
  operador!: Operador;

  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value) : value))
  id_categoria!: number; 
  
  

  @IsString()
  origen!: string;

  @IsString()
  destino!: string;

  @IsOptional()
  @IsString()
  crt?: string;

  @IsString() 
  es_facturado!: 'si' | 'no';
  @IsOptional()
  @IsString()
  factura_transporte?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  monto_factura?: number;

  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value) : value))
  id_cliente!: number;

  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value) : value))
  id_asignacion!: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value && value !== "" ? parseInt(value) : null))
  id_colaborador!: number;

  @IsNotEmpty({ message: 'La moneda es obligatorio'})
  @IsEnum(Moneda, { message: 'La moneda debe ser dolar o bolivianos' })
  moneda!: Moneda;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  tipo_cambio?: number;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  flete!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value && value !== "" ? Number(value) : 0))
  flete_adicional?: number;

  @IsDateString()
  fecha_inicio!: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;


  @IsOptional() 
  @Min(0)
  @IsNumber()
  @Transform(({ value }) => (value && value !== "" ? parseInt(value) : null))
  periodo_liquidacion?: number;

  @IsOptional()
  @IsString()
  descripcion_carga?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',').map(id => parseInt(id));
    return value;
  })
  ids_requisitos_aduaneros?: number[];

  

  
}