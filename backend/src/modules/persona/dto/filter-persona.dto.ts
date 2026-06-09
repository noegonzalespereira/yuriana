import { IsNumber, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class FilterPersonaDto {
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    ci?: number;

    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsString()
    ciudad?: string;


}