import { IsNotEmpty, IsNumber, IsString, IsEmail, IsOptional } from "class-validator";
import { CreatePersonaDto } from "../../persona/dto/create-persona.dto";

export class CreateClienteDto extends CreatePersonaDto{
    

    @IsNotEmpty({ message: 'El NIT es obligatorio' })
    @IsNumber()
    nit!: number;

    @IsNotEmpty({ message: 'La razón social es obligatoria' })
    @IsString()
    razon_social!: string;

    @IsOptional()
    @IsString()
    direccion?: string;

    @IsOptional()
    @IsString()
    notas?: string;

}
