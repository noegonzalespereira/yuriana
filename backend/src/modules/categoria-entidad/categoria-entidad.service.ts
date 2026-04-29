import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaEntidadDto } from './dto/create-categoria-entidad.dto';
import { UpdateCategoriaEntidadDto } from './dto/update-categoria-entidad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaEntidad } from './entities/categoria-entidad.entity';
import { FilterCategoriaEntidadDto } from './dto/filter-categoria-entidad.dto';
@Injectable()
export class CategoriaEntidadService {
  constructor(
    @InjectRepository(CategoriaEntidad)
    private readonly categoriaEntidadRepository: Repository<CategoriaEntidad>,
  ) {}

  async create(createCategoriaEntidadDto: CreateCategoriaEntidadDto): Promise<CategoriaEntidad> {
    const existe_categoria = await this.categoriaEntidadRepository.findOneBy({
      tipo_categoria: createCategoriaEntidadDto.tipo_categoria});
    if(existe_categoria){
      throw new ConflictException('El tipo de categoría ya existe')
    }

    const categoriaEntidad = this.categoriaEntidadRepository.create({
      ...createCategoriaEntidadDto,
    });
    return this.categoriaEntidadRepository.save(categoriaEntidad);
  }

  async findAll(filters: FilterCategoriaEntidadDto): Promise<CategoriaEntidad[]> {
    const query = this.categoriaEntidadRepository
    .createQueryBuilder('categoria_entidad');
    if(filters.tipo_categoria){
      query.where('categoria_entidad.tipo_categoria = :tipo_categoria', { tipo_categoria: filters.tipo_categoria });
    }
    return query.getMany();

  }

  async findOne(id_categoria: number) {
    const categoriaEntidad = await this.categoriaEntidadRepository.findOne({
      where: {id_categoria }
    });
    if(!categoriaEntidad){
      throw new NotFoundException('No se encontró la categoría de entidad');
    }
    return categoriaEntidad;
  }

  async update(id_categoria: number, updateCategoriaEntidadDto: UpdateCategoriaEntidadDto) {
    const categoriaEntidad = await this.findOne(id_categoria);
    Object.assign(categoriaEntidad, updateCategoriaEntidadDto);
    return this.categoriaEntidadRepository.save(categoriaEntidad);
  }

  async remove(id_categoria: number) {
    const categoriaEntidad = await this.findOne(id_categoria);
    return this.categoriaEntidadRepository.remove(categoriaEntidad);
  }
}
