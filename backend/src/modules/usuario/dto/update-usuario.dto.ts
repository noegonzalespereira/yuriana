import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsOptional, IsIn } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
    @IsOptional()
    @IsIn(['activo', 'inactivo'], { message: 'Estado debe ser "activo" o "inactivo"' })
    estado?: string;

}
