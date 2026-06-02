import { PartialType } from '@nestjs/mapped-types';
import { CreateUnidadDto } from './create-unidad.dto';
import { IsOptional, IsString } from 'class-validator';
export class UpdateUnidadDto extends PartialType(CreateUnidadDto) {
    @IsOptional()
    @IsString()
    fotos_eliminar?: string;
}
