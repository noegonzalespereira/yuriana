 
import { IsEnum, IsNotEmpty } from "class-validator";
import { TipoCategoria } from "../entities/categoria-entidad.entity";

export class CreateCategoriaEntidadDto {
    @IsNotEmpty({ message: 'El tipo de la categoría es obligatorio' })
    @IsEnum(TipoCategoria, { message: 'El tipo debe ser un valor de categoría válido' })
    tipo_categoria!: TipoCategoria;

}
