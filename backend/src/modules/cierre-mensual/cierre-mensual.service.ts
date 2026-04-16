import { Injectable } from '@nestjs/common';
import { CreateCierreMensualDto } from './dto/create-cierre-mensual.dto';
import { UpdateCierreMensualDto } from './dto/update-cierre-mensual.dto';

@Injectable()
export class CierreMensualService {
  create(createCierreMensualDto: CreateCierreMensualDto) {
    return 'This action adds a new cierreMensual';
  }

  findAll() {
    return `This action returns all cierreMensual`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cierreMensual`;
  }

  update(id: number, updateCierreMensualDto: UpdateCierreMensualDto) {
    return `This action updates a #${id} cierreMensual`;
  }

  remove(id: number) {
    return `This action removes a #${id} cierreMensual`;
  }
}
