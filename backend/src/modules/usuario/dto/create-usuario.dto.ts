import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional, IsNumber } from 'class-validator';
export class CreateUsuarioDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio'})
    nombre!: string;

    @IsEmail({},{ message: 'El correo electrónico no es válido'})
    @IsNotEmpty({ message: 'El correo es obligatorio'}) 
    correo!: string;

    @IsString()
    @IsNotEmpty({ message: 'La contraseña es obligatoria'})
    @MinLength(6,{ message: 'Mínimmo 6 caracteres'})
    password!: string;

    @IsNotEmpty({ message: 'El rol es obligatorio'})
    @IsNumber()
    id_rol!: number;

    
}



