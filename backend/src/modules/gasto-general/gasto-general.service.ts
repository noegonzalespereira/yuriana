import { Injectable } from '@nestjs/common';
import { CreateGastoGeneralDto } from './dto/create-gasto-general.dto';
import { UpdateGastoGeneralDto } from './dto/update-gasto-general.dto';

@Injectable()
export class GastoGeneralService {
  create(createGastoGeneralDto: CreateGastoGeneralDto) {
    return 'This action adds a new gastoGeneral';
  }

  findAll() {
    return `This action returns all gastoGeneral`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gastoGeneral`;
  }

  update(id: number, updateGastoGeneralDto: UpdateGastoGeneralDto) {
    return `This action updates a #${id} gastoGeneral`;
  }

  remove(id: number) {
    return `This action removes a #${id} gastoGeneral`;
  }
}
