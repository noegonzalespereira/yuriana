import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateRequisitoDocumentoDto {

    @IsNotEmpty({ message: 'La categoría es obligatoria' })
    @IsNumber()
    id_categoria!: number;

    @IsNotEmpty({ message: 'El nombre del documento es obligatorio' })
    @IsString()
    nombre_documento!: string;

    @IsNotEmpty({ message: 'Indica si el documento requiere vencimiento' })
    @IsBoolean()
    requiere_vencimiento!: boolean;

    @IsNotEmpty({ message: 'Indica si el documento es obligatorio' })
    @IsBoolean()
    es_obligatorio!: boolean;
}