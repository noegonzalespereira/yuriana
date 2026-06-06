import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Min} from "class-validator";
import { Transform } from "class-transformer";
import { CreatePersonaDto } from "../../persona/dto/create-persona.dto";
import { TipoColaborador } from "../entities/colaborador.entity";

export class CreateColaboradorDto extends CreatePersonaDto{
    @IsNotEmpty({ message: 'La agencia es obligatoria'})
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase().trim() : value)
    agencia!: string

    @IsNotEmpty({ message: 'El tipo de colaborador es obligatorio'})
    @IsEnum(TipoColaborador, { message: 'El tipo de colaborador debe ser ata o despachante' })
    tipo_colaborador!: TipoColaborador

    @IsNotEmpty({ message: 'El monto es obligatorio'})
    @IsNumber({}, { message: 'El monto debe ser un número' })
    @Min(0, { message: 'El monto no puede ser negativo' })
    monto!: number

    @IsOptional()
    @IsString()
    notas?: string
}
