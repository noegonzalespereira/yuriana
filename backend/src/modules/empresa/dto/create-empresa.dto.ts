import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateEmpresaDto {
    
    @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio' })
    @IsString()
    nombre!: string;
    
    @IsNotEmpty({message: 'El nit es obligario'})
    @IsString()
    nit!: string;
    
    @IsNotEmpty({message: 'El teléfono es obligatorio'})
    @IsString()
    telefono!: string;
        
    @IsNotEmpty({message: 'La dirección es obligatorio'})
    @IsString()
    direccion!: string;
    
    @IsNotEmpty({message: 'El número de paut es obligatorio'})
    @IsString()
    num_paut!: string;
    
    @IsNotEmpty({message: 'El número de permiso internacional es obligatorio'})
    @IsString()
    num_permiso_internacional!: string;

    @IsOptional()
    @IsEmail({}, { message: 'El correo debe ser un email válido' })
    correo?: string;


}
