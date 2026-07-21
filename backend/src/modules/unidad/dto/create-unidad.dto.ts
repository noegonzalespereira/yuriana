import { IsEnum,Min, Max, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { EstadoUnidad } from "../entities/unidad.entity";
import { Transform } from "class-transformer";

const toUpperTrim = ({ value }: { value: any }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value;

export class CreateUnidadDto {
    @IsNotEmpty({message: 'El numero de placa es obligatio'})
    @IsString()
    @Transform(toUpperTrim)
    placa!: string;

    @IsNotEmpty({message: 'El tipo de unidad es obligatorio '})
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber({},{message: 'El tipo de unidad debe ser un número'})
    id_categoria!: number;

    @IsNotEmpty({message: 'El numero de chasisi es obligatio'})
    @IsString()
    @Transform(toUpperTrim)
    num_chasis!: string;

    @IsNotEmpty({message: 'La marca es obligatio'})
    @IsString()
    @Transform(toUpperTrim)
    marca!: string;

    @IsNotEmpty({message: 'El color es obligatio'})
    @IsString()
    @Transform(toUpperTrim)
    color!: string;

    @IsNotEmpty({message: 'El año es obligatio'})
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber({},{message: 'El año debe ser un número'})
    @Min(1990, { message: 'El año no puede ser menor a 1990' })
    @Max(new Date().getFullYear(), { message: 'El año no puede ser mayor al año actual' })
    anio!: number;

    @IsNotEmpty({message: 'El modelo es obligatio'})
    @IsString()
    @Transform(toUpperTrim)
    modelo!: string;

    @IsOptional()
    @IsEnum(EstadoUnidad,{message: 'El estado de la unidad debe ser DISPONIBLE, EN VIAJE o MANTENIMIENTO'})
    estado_unidad?: EstadoUnidad

    @IsString()
    @IsOptional()
    num_poliza?: string;
}
