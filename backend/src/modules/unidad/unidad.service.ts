import { ConflictException,BadRequestException,NotFoundException, Injectable } from '@nestjs/common';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { UpdateUnidadDto } from './dto/update-unidad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unidad, EstadoUnidad} from './entities/unidad.entity';
import { CategoriaEntidadService } from '../categoria-entidad/categoria-entidad.service';
import { TipoCategoria } from '../categoria-entidad/entities/categoria-entidad.entity';
import { DocumentoService } from '../documento/documento.service';
import { FilterUnidadDto } from './dto/filter-unidad.dto';

@Injectable()
export class UnidadService {
  constructor(
    @InjectRepository(Unidad) private unidadRepository: Repository<Unidad>,
    private categoriaEntidadService: CategoriaEntidadService,
    private documentoService: DocumentoService,
  ) {}

  async create(createUnidadDto: CreateUnidadDto, userId: number): Promise<Unidad> {
    const placaNormalizada = createUnidadDto.placa.toUpperCase();
    const numChasisNormalizado = createUnidadDto.num_chasis.toUpperCase();
    const existe_placa = await this.unidadRepository.findOneBy({
      placa: placaNormalizada, status: true});
    if(existe_placa){
      throw new ConflictException('Placa ya registrada');
    }
    const existe_chasis = await this.unidadRepository.findOneBy({
      num_chasis: numChasisNormalizado,status: true});
    if(existe_chasis){
      throw new ConflictException('Número de chasis ya registrado');
    }
    const categoria = await this.categoriaEntidadService.findOne(
    createUnidadDto.id_categoria
    );

    const categoriasValidas = [
      TipoCategoria.TRACTO,
      TipoCategoria.SEMIREMOLQUE,
      TipoCategoria.REMOLQUE
    ];
    if (!categoriasValidas.includes(categoria.tipo_categoria)) {
      throw new BadRequestException(
        'La categoría debe ser Tracto, Semiremolque o Remolque'
      );
    }
    
    const nuevaUnidad = this.unidadRepository.create({
      ...createUnidadDto,
      placa: placaNormalizada,
      num_chasis: numChasisNormalizado,
      categoria: categoria,
      CreatedId: userId
    });
    return this.unidadRepository.save(nuevaUnidad);
  }

  async findAll(filters: FilterUnidadDto): Promise<Unidad[]>{
    const query = this.unidadRepository
      .createQueryBuilder('unidad')
      .leftJoinAndSelect('unidad.categoria', 'categoria')
      .where('unidad.status = :status', { status: true });
    
    if(filters.estado_unidad){
        query.andWhere('unidad.estado_unidad = :estado_unidad', { estado_unidad: filters.estado_unidad });
    }
    if(filters.id_categoria){
        query.andWhere('unidad.id_categoria = :id_categoria', { id_categoria: filters.id_categoria });
    }
    if (filters.placa) {
      query.andWhere('unidad.placa LIKE :placa', 
        { placa: `%${filters.placa.toUpperCase()}%` });
    }
    const unidades = await query.getMany();
    const unidadesEnriquecidas = await Promise.all(
      unidades.map(async (unidad) => {
        const estadoDoc = await this.documentoService
          .getEstadoDocumentosPorEntidad(
            unidad.id_unidad,
            'unidad'
          );
  
        return { ...unidad, ...estadoDoc };
      }),
    );
    if (filters.estado_documentos) {
      return unidadesEnriquecidas.filter(
        c => c.estado === filters.estado_documentos
      );
    }
  
    return unidadesEnriquecidas;
    
  }

  async findOne(placa: string): Promise<Unidad>{
    const unidad = await this.unidadRepository.findOne({
      where: { placa: placa.toUpperCase(), status: true },
      relations: ['categoria']
    });
    if (!unidad) {
      throw new NotFoundException('Unidad no encontrada');
    }
    return unidad;
    
  }

  async update(placa: string, updateUnidadDto: UpdateUnidadDto, userId: number) {
    const unidad = await this.findOne(placa);
    const { placa: nuevaPlaca, id_categoria, ...otrosDatos } = updateUnidadDto;
    if (nuevaPlaca) {
      throw new BadRequestException(
        'No se puede modificar la placa, es el identificador único de la unidad'
      );
    }
    if (id_categoria) {
      const categoria = await this.categoriaEntidadService.findOne(id_categoria);
      
      const categoriasValidas = [
        TipoCategoria.TRACTO,
        TipoCategoria.SEMIREMOLQUE,
        TipoCategoria.REMOLQUE
      ];
      if (!categoriasValidas.includes(categoria.tipo_categoria)) {
          throw new BadRequestException('La categoría debe ser Tracto, Semiremolque o Remolque');
      }
      unidad.categoria = categoria;
      unidad.id_categoria = id_categoria;
    }
    Object.assign(unidad, {
      ...updateUnidadDto,
      UpdatedId: userId
    });
    return this.unidadRepository.save(unidad);

  }

  async remove(placa: string, userId: number): Promise<Unidad>{
    const unidad = await this.findOne(placa);
    unidad.status = false;
    unidad.UpdatedId = userId;
    return this.unidadRepository.save(unidad);
  }
}
