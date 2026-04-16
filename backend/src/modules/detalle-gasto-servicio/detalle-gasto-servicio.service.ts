import { Injectable } from '@nestjs/common';
import { CreateDetalleGastoServicioDto } from './dto/create-detalle-gasto-servicio.dto';
import { UpdateDetalleGastoServicioDto } from './dto/update-detalle-gasto-servicio.dto';

@Injectable()
export class DetalleGastoServicioService {
  create(createDetalleGastoServicioDto: CreateDetalleGastoServicioDto) {
    return 'This action adds a new detalleGastoServicio';
  }

  findAll() {
    return `This action returns all detalleGastoServicio`;
  }

  findOne(id: number) {
    return `This action returns a #${id} detalleGastoServicio`;
  }

  update(id: number, updateDetalleGastoServicioDto: UpdateDetalleGastoServicioDto) {
    return `This action updates a #${id} detalleGastoServicio`;
  }

  remove(id: number) {
    return `This action removes a #${id} detalleGastoServicio`;
  }
}
