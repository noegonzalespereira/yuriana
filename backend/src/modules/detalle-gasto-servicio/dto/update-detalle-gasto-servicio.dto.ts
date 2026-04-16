import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleGastoServicioDto } from './create-detalle-gasto-servicio.dto';

export class UpdateDetalleGastoServicioDto extends PartialType(CreateDetalleGastoServicioDto) {}
