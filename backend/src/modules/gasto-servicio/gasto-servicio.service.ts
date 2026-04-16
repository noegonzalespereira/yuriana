import { Injectable } from '@nestjs/common';
import { CreateGastoServicioDto } from './dto/create-gasto-servicio.dto';
import { UpdateGastoServicioDto } from './dto/update-gasto-servicio.dto';

@Injectable()
export class GastoServicioService {
  create(createGastoServicioDto: CreateGastoServicioDto) {
    return 'This action adds a new gastoServicio';
  }

  findAll() {
    return `This action returns all gastoServicio`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gastoServicio`;
  }

  update(id: number, updateGastoServicioDto: UpdateGastoServicioDto) {
    return `This action updates a #${id} gastoServicio`;
  }

  remove(id: number) {
    return `This action removes a #${id} gastoServicio`;
  }
}
