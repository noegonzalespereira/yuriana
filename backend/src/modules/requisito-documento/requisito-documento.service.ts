import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequisitoDocumentoDto } from './dto/create-requisito-documento.dto';
import { UpdateRequisitoDocumentoDto } from './dto/update-requisito-documento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequisitoDocumento } from './entities/requisito-documento.entity';
import { FilterRequisitoDocumentoDto } from './dto/filter-requisito-documento.dto';
import { CategoriaEntidadService } from '../categoria-entidad/categoria-entidad.service';
@Injectable()
export class RequisitoDocumentoService {
  constructor(
    @InjectRepository(RequisitoDocumento)
    private readonly requisitoDocumentoRepository: Repository<RequisitoDocumento>,
    private readonly categoriaEntidadService: CategoriaEntidadService
  ) {}
  async create(createRequisitoDocumentoDto: CreateRequisitoDocumentoDto, userId: number): Promise<RequisitoDocumento> {
    await this.categoriaEntidadService.findOne(
      createRequisitoDocumentoDto.id_categoria
    );
    const existe = await this.requisitoDocumentoRepository.findOne({
      where: {
        id_categoria: createRequisitoDocumentoDto.id_categoria,
        nombre_documento: createRequisitoDocumentoDto.nombre_documento,
        status: true
      }
      });
      if(existe){
        throw new ConflictException('Este requisito ya existe para esta categoría');
      } 
      const requisitoDocumento = this.requisitoDocumentoRepository.create({
        ...createRequisitoDocumentoDto,
        CreatedId: userId,
      });
      return this.requisitoDocumentoRepository.save(requisitoDocumento);
  }

  async findAll(filters: FilterRequisitoDocumentoDto): Promise<RequisitoDocumento[]> {
    const query = this.requisitoDocumentoRepository
    .createQueryBuilder('requisito')
    .leftJoinAndSelect('requisito.categoria', 'categoria') 
    .where('requisito.status = :status', { status: true });
    if (filters.id_categoria) {
    query.andWhere('requisito.id_categoria = :id_categoria', { id_categoria: filters.id_categoria });
    }
    if (filters.nombre_documento) {
    query.andWhere('requisito.nombre_documento ILIKE :nombre', { nombre: `%${filters.nombre_documento}%` });
    }
    return query.getMany();
  }

  async findOne(id: number):Promise<RequisitoDocumento> {
    const requisitoDocumento = await this.requisitoDocumentoRepository.findOne({
      where: {id_requisito_documento: id, status: true}
    });
    if(!requisitoDocumento){
      throw new NotFoundException('Requisito no encontrado');
    }
    return requisitoDocumento;
  }

  async update(id: number, updateRequisitoDocumentoDto: UpdateRequisitoDocumentoDto, userId: number) {
    const requisitoDocumento = await this.findOne(id);
    Object.assign(requisitoDocumento, {
      ...updateRequisitoDocumentoDto, UpdatedId: userId
    });
    return this.requisitoDocumentoRepository.save(requisitoDocumento);

  }

  async remove(id: number, userId: number): Promise<RequisitoDocumento> {
    const requisitoDocumento = await this.findOne(id);
    requisitoDocumento.status = false;
    requisitoDocumento.UpdatedId = userId;
    return this.requisitoDocumentoRepository.save(requisitoDocumento);

  }
}
