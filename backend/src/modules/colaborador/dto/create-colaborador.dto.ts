import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max, IsEmail, Matches, MinLength } from "class-validator";
import { Transform } from "class-transformer";
import { TipoColaborador } from "../entities/colaborador.entity";

const TELEFONO_MIN = 10000000; // 8 dígitos
const TELEFONO_MAX = 999999999999999; // 15 dígitos
const TELEFONO_MSG = 'El teléfono debe tener entre 8 y 15 dígitos (ej: 68626895)';

const toUpperTrim = ({ value }: { value: any }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value;

export class CreateColaboradorDto {
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString()
    @Transform(toUpperTrim)
    nombre!: string;

    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    correo!: string;

    @IsNotEmpty({ message: 'El teléfono es obligatorio' })
    @IsNumber({}, { message: 'El teléfono debe ser un número' })
    @Min(TELEFONO_MIN, { message: TELEFONO_MSG })
    @Max(TELEFONO_MAX, { message: TELEFONO_MSG })
    telefono!: number;

    @IsOptional()
    @IsString({ message: 'El CI/NIT debe ser texto numérico' })
    @Matches(/^\d+$/, { message: 'El CI/NIT solo debe contener números' })
    @MinLength(5, { message: 'El CI debe tener al menos 5 dígitos' })
    ci?: string;

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
    @IsString()
    @Transform(toUpperTrim)
    agencia?: string

    @IsNotEmpty({ message: 'El tipo de colaborador es obligatorio'})
    @IsEnum(TipoColaborador, { message: 'El tipo de colaborador debe ser ata o despachante' })
    tipo_colaborador!: TipoColaborador

    @IsNotEmpty({ message: 'El monto es obligatorio'})
    @IsNumber({}, { message: 'El monto debe ser un número' })
    @Min(0, { message: 'El monto no puede ser negativo' })
    monto!: number

    @IsOptional()
    @IsString()
    notas?: string
}
