import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { Transform } from "class-transformer";

const toUpperTrim = ({ value }: { value: any }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value;

const TELEFONO_MIN = 10000000; // 8 dígitos
const TELEFONO_MAX = 999999999999999; // 15 dígitos
const TELEFONO_MSG = 'El teléfono debe tener entre 8 y 15 dígitos (ej: 68626895)';

export class CreateClienteDto {
    @IsNotEmpty({ message: 'El nombre del contacto es obligatorio' })
    @IsString()
    @Transform(toUpperTrim)
    nombre!: string;

    @IsNotEmpty({ message: 'El teléfono es obligatorio' })
    @IsNumber({}, { message: 'El teléfono debe ser un número' })
    @Min(TELEFONO_MIN, { message: TELEFONO_MSG })
    @Max(TELEFONO_MAX, { message: TELEFONO_MSG })
    telefono!: number;

    @IsOptional()
    @IsNumber({}, { message: 'El CI debe ser un número' })
    @Min(10000, { message: 'El CI debe tener al menos 5 dígitos' })
    @Max(99999999, { message: 'El CI no puede tener más de 8 dígitos' })
    ci?: number;

    @IsOptional()
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    correo?: string;

    @IsOptional()
    @IsNumber({}, { message: 'El teléfono debe ser un número' })
    @Min(TELEFONO_MIN, { message: TELEFONO_MSG })
    @Max(TELEFONO_MAX, { message: TELEFONO_MSG })
    telefono2?: number;

    @IsOptional()
    @IsString()
    @Transform(toUpperTrim)
    ciudad?: string;

    @IsOptional()
    @IsNumber({}, { message: 'El NIT debe ser un número' })
    @Min(1, { message: 'El NIT debe ser un número positivo' })
    @Max(TELEFONO_MAX, { message: 'El NIT no puede tener más de 15 dígitos' })
    nit?: number;

    @IsOptional()
    @IsString()
    @Transform(toUpperTrim)
    razon_social?: string;

    @IsOptional()
    @IsString()
    @Transform(toUpperTrim)
    direccion?: string;

    @IsOptional()
    @IsString()
    notas?: string;
}
