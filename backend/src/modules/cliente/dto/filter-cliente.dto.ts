import { IsOptional, IsString } from "class-validator";
import { FilterPersonaDto } from "../../persona/dto/filter-persona.dto";
export class FilterClienteDto extends FilterPersonaDto{
    @IsOptional()
    @IsString()
    codigo_cliente?: string;

    

}