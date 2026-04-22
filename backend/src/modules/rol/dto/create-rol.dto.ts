import {  IsString, IsNotEmpty} from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateRolDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio'})
    @Transform(({ value }) => value.toLowerCase().trim())
    nombre!: string;
}