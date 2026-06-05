import { IsNotEmpty,Min,IsNumber,IsString } from "class-validator";


export class CreateIngresoExtraDto {

    @IsNotEmpty({ message: 'La fecha de la fila es obligatoria' })
    @IsString()
    fecha!: string;
    
    @IsNotEmpty({message: 'La descripción es obligaria'})
    @IsString()
    descripcion!: string;
    
    @IsNotEmpty({ message: 'El monto es obligatorio' })
    @IsNumber({}, { message: 'El monto debe ser un número válido' })
    @Min(0.01, { message: 'El monto debe ser mayor a cero' })
    monto!: number;
        
  
}
