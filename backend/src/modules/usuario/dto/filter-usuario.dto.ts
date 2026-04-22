import { IsOptional, IsString } from "class-validator";

export class FilterUsuarioDto {
    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsString()
    estado?: string;

    @IsOptional()
    @IsString()
    rol?: string;
}