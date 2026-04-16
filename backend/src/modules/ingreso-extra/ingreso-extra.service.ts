import { Injectable } from '@nestjs/common';
import { CreateIngresoExtraDto } from './dto/create-ingreso-extra.dto';
import { UpdateIngresoExtraDto } from './dto/update-ingreso-extra.dto';

@Injectable()
export class IngresoExtraService {
  create(createIngresoExtraDto: CreateIngresoExtraDto) {
    return 'This action adds a new ingresoExtra';
  }

  findAll() {
    return `This action returns all ingresoExtra`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ingresoExtra`;
  }

  update(id: number, updateIngresoExtraDto: UpdateIngresoExtraDto) {
    return `This action updates a #${id} ingresoExtra`;
  }

  remove(id: number) {
    return `This action removes a #${id} ingresoExtra`;
  }
}
