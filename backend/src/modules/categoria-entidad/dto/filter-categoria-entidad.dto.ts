import { IsOptional, IsEnum } from "class-validator";
import { TipoCategoria } from "../entities/categoria-entidad.entity";

export class FilterCategoriaEntidadDto {
    @IsOptional()
    @IsEnum(TipoCategoria, { message: 'El tipo debe ser un valor de categoría válido' })
    tipo_categoria?: TipoCategoria;
}