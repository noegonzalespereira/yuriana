import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsOptional, IsIn, IsString, MinLength } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
    @IsOptional()
    @IsIn(['ACTIVO', 'INACTIVO'], { message: 'Estado debe ser "activo" o "inactivo"' })
   
    estado?: string;

    // Se añade la contraseña como opcional para la actualización
    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'La nueva contraseña debe tener mínimo 6 caracteres' })
    password?: string;
}
