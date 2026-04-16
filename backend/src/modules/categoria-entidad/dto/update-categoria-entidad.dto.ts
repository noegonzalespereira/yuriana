import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaEntidadDto } from './create-categoria-entidad.dto';

export class UpdateCategoriaEntidadDto extends PartialType(CreateCategoriaEntidadDto) {}
