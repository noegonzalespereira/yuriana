import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoPestaña {
  SERVICIO = 'SERVICIO',
  OPERATIVO = 'OPERATIVO',
  ADMINISTRATIVO = 'ADMINISTRATIVO',
  GENERAL = 'GENERAL'
}

// Representa cada fila agregada dinámicamente en tus tablas naranjas de registro
export class ItemGastoDto {
  @IsNotEmpty({ message: 'La fecha de la fila es obligatoria' })
  @IsString()
  fecha!: string;

  @IsNotEmpty({ message: 'El tipo de gasto es obligatorio' })
  @IsString()
  tipo_gasto!: string; // Evaluará tus Enums según la pestaña activa

  @IsNotEmpty({ message: 'La descripción del ítem es obligatoria' })
  @IsString()
  descripcion!: string;

  @IsNotEmpty({ message: 'El monto es obligatorio' })
  @IsNumber({}, { message: 'El monto debe ser un número válido' })
  @Min(0.01, { message: 'El monto debe ser mayor a cero' })
  monto!: number;
}

// Cuerpo unificado que recibe el endpoint POST /api/gastos/guardar-pantalla
export class CreateGastoBulkDto {
  @IsNotEmpty({ message: 'El tipo de pestaña es obligatorio (servicio, operativo, administrativo, general)' })
  @IsEnum(TipoPestaña)
  tipo_pestaña!: TipoPestaña;

  // --- Atributos de Cabecera (Pestaña 1: Viajes) ---
  @IsOptional()
  @IsString()
  codigo_servicio?: string; // El usuario introduce "YUR-4" en el selector frontend

  @IsOptional()
  @IsString()
  moneda?: string; // 'uyu', 'usd', 'bob'

  @IsOptional()
  @IsNumber()
  tipo_cambio?: number;

  @IsOptional()
  @IsNumber()
  viatico_entregado?: number;

  // --- Atributos de Cabecera (Pestaña 2: Operativos) ---
  @IsOptional()
  @IsString()
  placa?: string; // El usuario introduce la placa en el input de texto

  // --- Atributos para Administrativos y Generales ---
  @IsOptional()
  @IsNumber()
  id_empresa?: number;

  // --- Array de filas de la tabla ---
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemGastoDto)
  items!: ItemGastoDto[];
}