import { Injectable } from '@nestjs/common';
import { CreateRequisitoDocumentoDto } from './dto/create-requisito-documento.dto';
import { UpdateRequisitoDocumentoDto } from './dto/update-requisito-documento.dto';

@Injectable()
export class RequisitoDocumentoService {
  create(createRequisitoDocumentoDto: CreateRequisitoDocumentoDto) {
    return 'This action adds a new requisitoDocumento';
  }

  findAll() {
    return `This action returns all requisitoDocumento`;
  }

  findOne(id: number) {
    return `This action returns a #${id} requisitoDocumento`;
  }

  update(id: number, updateRequisitoDocumentoDto: UpdateRequisitoDocumentoDto) {
    return `This action updates a #${id} requisitoDocumento`;
  }

  remove(id: number) {
    return `This action removes a #${id} requisitoDocumento`;
  }
}
