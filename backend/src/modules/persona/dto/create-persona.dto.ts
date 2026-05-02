import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePersonaDto {
    @IsNotEmpty({ message: 'La cédula es obligatoria' })
    @IsNumber()
    ci!: number;

    @IsNotEmpty({ message: 'El nombre es obligario'})
    @IsString()
    nombre!: string;

    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    correo!: string;

    @IsNotEmpty({ message: 'El teléfono es obligatorio' })
    @IsNumber({}, { message: 'El telefono debe ser un número' })
    telefono!: number;
    
    @IsOptional()
    @IsNumber({}, { message: 'El telefono debe ser un número' })
    telefono2?: number;

    @IsOptional()
    @IsString()
    ciudad?: string;



}
