import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

const toUpperTrim = ({ value }: { value: any }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value;

export class CreateEmpresaDto {

    @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio' })
    @IsString()
    @Transform(toUpperTrim)
    nombre!: string;

    @IsNotEmpty({message: 'El nit es obligario'})
    @IsString()
    @Transform(toUpperTrim)
    nit!: string;

    @IsNotEmpty({message: 'El teléfono es obligatorio'})
    @IsString()
    @Transform(toUpperTrim)
    telefono!: string;

    @IsNotEmpty({message: 'La dirección es obligatorio'})
    @IsString()
    @Transform(toUpperTrim)
    direccion!: string;

    @IsNotEmpty({message: 'El número de paut es obligatorio'})
    @IsString()
    @Transform(toUpperTrim)
    num_paut!: string;

    @IsNotEmpty({message: 'El número de permiso internacional es obligatorio'})
    @IsString()
    @Transform(toUpperTrim)
    num_permiso_internacional!: string;

    @IsOptional()
    @IsEmail({}, { message: 'El correo debe ser un email válido' })
    correo?: string;


}
