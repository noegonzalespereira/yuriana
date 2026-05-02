import { IsNumber, IsOptional, IsString } from "class-validator";

export class FilterPersonaDto {
    @IsOptional()
    @IsNumber()
    ci?: number;

    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsString()
    ciudad?: string;


}