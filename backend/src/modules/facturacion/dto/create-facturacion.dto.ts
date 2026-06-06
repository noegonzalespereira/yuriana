import { IsNotEmpty, IsNumber, IsString, IsOptional } from "class-validator";
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
    @Transform(({ value }) => parseFloat(value))
    monto_factura!: number;

    @IsOptional()
    @IsString()
    foto_factura?: string;
}