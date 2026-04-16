import { Injectable } from '@nestjs/common';
import { CreateGastoAdministrativoDto } from './dto/create-gasto-administrativo.dto';
import { UpdateGastoAdministrativoDto } from './dto/update-gasto-administrativo.dto';

@Injectable()
export class GastoAdministrativoService {
  create(createGastoAdministrativoDto: CreateGastoAdministrativoDto) {
    return 'This action adds a new gastoAdministrativo';
  }

  findAll() {
    return `This action returns all gastoAdministrativo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gastoAdministrativo`;
  }

  update(id: number, updateGastoAdministrativoDto: UpdateGastoAdministrativoDto) {
    return `This action updates a #${id} gastoAdministrativo`;
  }

  remove(id: number) {
    return `This action removes a #${id} gastoAdministrativo`;
  }
}
