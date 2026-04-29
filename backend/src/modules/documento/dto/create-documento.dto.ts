import { IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class CreateDocumentoDto {
    @IsNotEmpty({ message: 'El id del requisito es obligatorio' })
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    id_requisito!: number;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha de vencimiento debe ser una fecha válida' })
    fecha_vencimiento?: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? parseInt(value) : undefined)
    id_conductor?: number;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? parseInt(value) : undefined)
    id_unidad?: number;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? parseInt(value) : undefined)
    id_servicio?: number;

}
