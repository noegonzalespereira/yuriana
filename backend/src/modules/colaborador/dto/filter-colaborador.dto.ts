import { IsOptional, IsEnum} from "class-validator";
import { FilterPersonaDto } from "../../persona/dto/filter-persona.dto";
import { TipoColaborador } from "../entities/colaborador.entity";
export class FilterColaboradorDto extends FilterPersonaDto{
    @IsOptional()
    @IsEnum(TipoColaborador, { message: 'El tipo de colaborador debe ser ata o despachante' })
    tipo_colaborador?: TipoColaborador

    

}