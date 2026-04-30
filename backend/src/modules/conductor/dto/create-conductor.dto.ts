import { IsNumber, IsOptional, IsEnum, Min } from "class-validator"
import { CreatePersonaDto } from "../../persona/dto/create-persona.dto"
import { EstadoLaboral, EstadoOperativo } from "../entities/conductor.entity"
export class CreateConductorDto extends CreatePersonaDto{

    @IsOptional()
    @IsNumber({},{message: 'El sueldo debe ser un número'})
    @Min(0, { message: 'El monto no puede ser negativo' })
    sueldo?: number

    @IsOptional()
    @IsEnum(EstadoOperativo,{message: 'El estado operativo debe ser disponible o en viaje'})
    estado_operativo!: EstadoOperativo

    @IsOptional()
    @IsEnum(EstadoLaboral,{message: 'El estado laboral debe ser activo o inactivo'})
    estado_laboral!: EstadoLaboral
}
