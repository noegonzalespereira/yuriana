import { Injectable } from '@nestjs/common';
import { CreateCategoriaEntidadDto } from './dto/create-categoria-entidad.dto';
import { UpdateCategoriaEntidadDto } from './dto/update-categoria-entidad.dto';

@Injectable()
export class CategoriaEntidadService {
  create(createCategoriaEntidadDto: CreateCategoriaEntidadDto) {
    return 'This action adds a new categoriaEntidad';
  }

  findAll() {
    return `This action returns all categoriaEntidad`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categoriaEntidad`;
  }

  update(id: number, updateCategoriaEntidadDto: UpdateCategoriaEntidadDto) {
    return `This action updates a #${id} categoriaEntidad`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoriaEntidad`;
  }
}
