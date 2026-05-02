import { IsEnum, IsOptional,IsIn, IsString } from "class-validator";
import { EstadoUnidad } from "../entities/unidad.entity";
import { Transform } from "class-transformer";

export class FilterUnidadDto{
    @IsOptional()
    @IsEnum(EstadoUnidad,{message: 'El estado de la unidad debe ser disponible, en viaje o mantenimiento'})
    estado_unidad?: EstadoUnidad

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    id_categoria?: number

    @IsOptional()
    @IsString()
    placa?: string

    @IsOptional()
    @IsIn(['vigente', 'por_vencer', 'vencido', 'sin_documentos'], {
    message: 'estado_documentos debe ser vigente, por_vencer, vencido o sin_documentos'
    })
    estado_documentos?: string




}