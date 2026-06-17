import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { Transform } from "class-transformer";

const TELEFONO_MIN = 10000000;
const TELEFONO_MAX = 99999999;
const TELEFONO_MSG = 'El teléfono debe tener exactamente 8 dígitos (ej: 68626895)';

export class CreatePersonaDto {
    @IsNotEmpty({ message: 'La cédula es obligatoria' })
    @IsNumber()
    @Min(10000, { message: 'El CI debe tener al menos 5 dígitos' })
    @Max(99999999, { message: 'El CI no puede tener más de 8 dígitos' })
    ci!: number;

    @IsNotEmpty({ message: 'El nombre es obligario'})
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase().trim() : value)
    nombre!: string;

    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    correo!: string;

    @IsNotEmpty({ message: 'El teléfono es obligatorio' })
    @IsNumber({}, { message: 'El telefono debe ser un número' })
    @Min(TELEFONO_MIN, { message: TELEFONO_MSG })
    @Max(TELEFONO_MAX, { message: TELEFONO_MSG })
    telefono!: number;

    @IsOptional()
    @IsNumber({}, { message: 'El telefono debe ser un número' })
    @Min(TELEFONO_MIN, { message: TELEFONO_MSG })
    @Max(TELEFONO_MAX, { message: TELEFONO_MSG })
    telefono2?: number;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase().trim() : value)
    ciudad?: string;



}
