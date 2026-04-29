import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class FilterRequisitoDocumentoDto {

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value)) 
    id_categoria?: number;

    @IsOptional()
    @IsString()
    nombre_documento?: string;

    // @IsOptional()
    // @IsBoolean()
    // @Transform(({ value }) => {   // mismo problema — Query params vienen como string
    //   if (value === 'true') return true;
    //   if (value === 'false') return false;
    //   return value;
    // })
    // es_obligatorio?: boolean;
}