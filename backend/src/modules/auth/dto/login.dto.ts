import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({},{ message: 'El correo electrónico no es válido'})
  @IsNotEmpty({ message: 'El correo es obligatorio'}) 
  correo!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria'})
  @MinLength(6,{ message: 'Mínimmo 6 caracteres'})
  password!: string;


}