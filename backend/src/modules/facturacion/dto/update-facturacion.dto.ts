import { PartialType } from '@nestjs/mapped-types';
import { CreateFacturacionDto } from './create-facturacion.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateFacturacionDto extends PartialType(CreateFacturacionDto) {
  @IsOptional()
  @IsString()
  ids_fotos_eliminar?: string;

  @IsOptional()
  @IsString()
  eliminar_foto_principal?: string;
}
