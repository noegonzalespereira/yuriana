import { Injectable } from '@nestjs/common';
import { CreateGastoOperativoDto } from './dto/create-gasto-operativo.dto';
import { UpdateGastoOperativoDto } from './dto/update-gasto-operativo.dto';

@Injectable()
export class GastoOperativoService {
  create(createGastoOperativoDto: CreateGastoOperativoDto) {
    return 'This action adds a new gastoOperativo';
  }

  findAll() {
    return `This action returns all gastoOperativo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gastoOperativo`;
  }

  update(id: number, updateGastoOperativoDto: UpdateGastoOperativoDto) {
    return `This action updates a #${id} gastoOperativo`;
  }

  remove(id: number) {
    return `This action removes a #${id} gastoOperativo`;
  }
}
