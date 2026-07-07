import { IsOptional, IsString } from "class-validator";

export class FilterClienteDto {
    @IsOptional()
    @IsString()
    buscar?: string;

    @IsOptional()
    @IsString()
    codigo_cliente?: string;

    @IsOptional()
    @IsString()
    nombre?: string;
}
