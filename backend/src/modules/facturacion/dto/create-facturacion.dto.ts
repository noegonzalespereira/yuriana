import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";

export class CreateFacturacionDto {
    @IsNotEmpty({ message: "El id del servicio es obligatorio" })
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    id_servicio!: number;

    @IsNotEmpty({ message: "El número de factura es obligatorio" })
    @IsString()
    factura_transporte!: string;

    @IsNotEmpty({ message: "El monto de la factura es obligatorio" })
    @IsNumber()
    @Min(0.01, { message: "El monto de la factura debe ser mayor a cero" })
    @Transform(({ value }) => parseFloat(value))
    monto_factura!: number;

    @IsOptional()
    @IsString()
    foto_factura?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === true || value === 'true')
    transmitido?: boolean;
}