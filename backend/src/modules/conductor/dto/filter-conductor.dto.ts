import { IsEnum, IsOptional, IsIn } from "class-validator";
import { FilterPersonaDto } from "../../persona/dto/filter-persona.dto";
import { EstadoOperativo } from "../entities/conductor.entity";
import { EstadoLaboral } from "../entities/conductor.entity";

export class FilterConductorDto extends FilterPersonaDto{

        @IsOptional()
        @IsEnum(EstadoOperativo,{message: 'El estado operativo debe ser disponible o en viaje'})
        estado_operativo?: EstadoOperativo

        @IsOptional()
        @IsEnum(EstadoLaboral,{message: 'El estado laboral debe ser activo o inactivo'})
        estado_laboral?: EstadoLaboral
        @IsOptional()
        @IsIn(['vigente', 'por_vencer', 'vencido', 'sin_documentos'], {
        message: 'estado_documentos debe ser vigente, por_vencer, vencido o sin_documentos'
        })
        estado_documentos?: string

}