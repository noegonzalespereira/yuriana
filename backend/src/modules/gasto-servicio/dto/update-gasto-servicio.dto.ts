import { PartialType } from '@nestjs/mapped-types';
import { CreateGastoServicioDto } from './create-gasto-servicio.dto';

export class UpdateGastoServicioDto extends PartialType(CreateGastoServicioDto) {}
