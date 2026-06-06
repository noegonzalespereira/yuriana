import { IsNotEmpty, IsNumber, IsString, IsEmail, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import { CreatePersonaDto } from "../../persona/dto/create-persona.dto";

const toUpperTrim = ({ value }: { value: any }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value;

export class CreateClienteDto extends CreatePersonaDto{

    @IsNotEmpty({ message: 'El NIT es obligatorio' })
    @IsNumber({}, { message: 'El NIT debe ser un número' })
    nit!: number;

    @IsNotEmpty({ message: 'La razón social es obligatoria' })
    @IsString()
    @Transform(toUpperTrim)
    razon_social!: string;

    @IsOptional()
    @IsString()
    @Transform(toUpperTrim)
    direccion?: string;

    @IsOptional()
    @IsString()
    notas?: string;

}
