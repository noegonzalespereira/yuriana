import { ConflictException, BadRequestException, NotFoundException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Unidad, EstadoUnidad } from './entities/unidad.entity';
import { CategoriaEntidadService } from '../categoria-entidad/categoria-entidad.service';
import { TipoCategoria } from '../categoria-entidad/entities/categoria-entidad.entity';
import { DocumentoService } from '../documento/documento.service';
import { FilterUnidadDto } from './dto/filter-unidad.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { FotoUnidad } from '../foto_unidad/entities/foto-unidad.entity';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { UpdateUnidadDto } from './dto/update-unidad.dto';

@Injectable()
export class UnidadService {
  constructor(
    @InjectRepository(Unidad) private unidadRepository: Repository<Unidad>,
    @InjectRepository(FotoUnidad) private fotoUnidadRepository: Repository<FotoUnidad>, // Inyectar si se usa fuera de queryRunner
    private categoriaEntidadService: CategoriaEntidadService,
    private documentoService: DocumentoService,
    private cloudinaryService: CloudinaryService,
    private dataSource: DataSource,
  ) {}

  async create(createUnidadDto: CreateUnidadDto, files: Express.Multer.File[], userId: number): Promise<Unidad> {
  const placaNormalizada = createUnidadDto.placa.toUpperCase();
  const numChasisNormalizado = createUnidadDto.num_chasis.toUpperCase();
  
  const existe_placa = await this.unidadRepository.findOneBy({ placa: placaNormalizada, status: true });
  if (existe_placa) throw new ConflictException('Placa ya registrada');

  const existe_chasis = await this.unidadRepository.findOneBy({ num_chasis: numChasisNormalizado, status: true });
  if (existe_chasis) throw new ConflictException('Número de chasis ya registrado');

  const categoria = await this.categoriaEntidadService.findOne(createUnidadDto.id_categoria);
  const categoriasValidas = [TipoCategoria.TRACTO, TipoCategoria.SEMIREMOLQUE, TipoCategoria.REMOLQUE];
  
  if (!categoriasValidas.includes(categoria.tipo_categoria)) {
    throw new BadRequestException('La categoría debe ser Tracto, Semiremolque o Remolque');
  }

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const nuevaUnidad = this.unidadRepository.create({
      ...createUnidadDto,
      placa: placaNormalizada,
      num_chasis: numChasisNormalizado,
      categoria: categoria,
      CreatedId: userId
    });
    
    const unidadGuardada = await queryRunner.manager.save(nuevaUnidad);

    // AUDITORÍA EN CONSOLA: Verificamos si los archivos físicos realmente están llegando al service
    console.log("[UnidadService] Cantidad de fotos recibidas para subir:", files?.length || 0);

    if (files && files.length > 0) {
      // Obtenemos el repositorio específico vinculado al hilo transaccional actual
      const fotoRepoTransaccional = queryRunner.manager.getRepository(FotoUnidad);

      for (const file of files) {
        const { url } = await this.cloudinaryService.subirArchivo(file, 'yuriana/unidades/fotos');
        console.log("[UnidadService] Foto subida a Cloudinary exitosamente:", url);
        
        // Creamos y guardamos usando el repositorio transaccional explícito
        const fotoRegistro = fotoRepoTransaccional.create({
          id_unidad: unidadGuardada.id_unidad,
          url_foto: url,
          CreatedId: userId
        });
        
        await fotoRepoTransaccional.save(fotoRegistro);
      }
    }

    await queryRunner.commitTransaction();
    return await this.findOne(unidadGuardada.placa);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

  async findAll(filters: FilterUnidadDto): Promise<any[]> {
    const query = this.unidadRepository
      .createQueryBuilder('unidad')
      .leftJoinAndSelect('unidad.categoria', 'categoria')
      .leftJoinAndSelect('unidad.fotos', 'fotos')
      .where('unidad.status = :status', { status: true });
    
    if (filters.estado_unidad) query.andWhere('unidad.estado_unidad = :estado_unidad', { estado_unidad: filters.estado_unidad });
    if (filters.id_categoria) query.andWhere('unidad.id_categoria = :id_categoria', { id_categoria: filters.id_categoria });
    
    if (filters.placa) {
      query.andWhere('unidad.placa LIKE :placa', { placa: `%${filters.placa.toUpperCase()}%` });
    }

    const unidades = await query.getMany();
    const unidadesEnriquecidas = await Promise.all(
      unidades.map(async (unidad) => {
        unidad.fotos = (unidad.fotos || []).filter(f => f.status === true);
        const estadoDoc = await this.documentoService.getEstadoDocumentosPorEntidad(unidad.id_unidad, 'unidad');
        return { ...unidad, ...estadoDoc };
      }),
    );

    if (filters.estado_documentos) {
      return unidadesEnriquecidas.filter(c => c.estado === filters.estado_documentos);
    }
    return unidadesEnriquecidas;
  }

  async findOne(placa: string): Promise<Unidad> {
    const unidad = await this.unidadRepository.findOne({
      where: { placa: placa.toUpperCase(), status: true },
      relations: ['categoria', 'fotos']
    });
    if (!unidad) throw new NotFoundException('Unidad no encontrada');
    return unidad;
  }

  

async update(placa: string, updateUnidadDto: UpdateUnidadDto, files: Express.Multer.File[], userId: number, fotosEliminarIds: number[] = []) {
  console.log('DTO recibido en update:', JSON.stringify(updateUnidadDto, null, 2));
  console.log('Fotos a eliminar:', fotosEliminarIds);
  const unidadOriginal = await this.findOne(placa);
  const { placa: nuevaPlaca, id_categoria, num_chasis } = updateUnidadDto;

  if (nuevaPlaca) {
    throw new BadRequestException('No se puede modificar la placa');
  }

  if (num_chasis && num_chasis.toUpperCase() !== unidadOriginal.num_chasis) {
    const chasisNormalizado = num_chasis.toUpperCase();
    const existeChasis = await this.unidadRepository.findOneBy({ 
      num_chasis: chasisNormalizado, status: true 
    });
    if (existeChasis && existeChasis.id_unidad !== unidadOriginal.id_unidad) {
      throw new ConflictException('Número de chasis ya registrado en otra unidad');
    }
  }

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const fotoRepo = queryRunner.manager.getRepository(FotoUnidad);
    if (fotosEliminarIds.length > 0) {
      for (const idFoto of fotosEliminarIds) {
        await fotoRepo.update(
          { id_foto: idFoto, id_unidad: unidadOriginal.id_unidad },
          { status: false, UpdatedId: userId }
        );
      }
    }
    if (files && files.length > 0) {
      for (const file of files) {
        const { url } = await this.cloudinaryService.subirArchivo(file, 'yuriana/unidades/fotos');
        const nuevaFoto = fotoRepo.create({
          id_unidad: unidadOriginal.id_unidad,
          url_foto: url,
          CreatedId: userId
        });
        await fotoRepo.save(nuevaFoto);
      }
    }
    if (id_categoria) {
      const categoria = await this.categoriaEntidadService.findOne(id_categoria);
      const categoriasValidas = [TipoCategoria.TRACTO, TipoCategoria.SEMIREMOLQUE, TipoCategoria.REMOLQUE];
      if (!categoriasValidas.includes(categoria.tipo_categoria)) {
        throw new BadRequestException('Categoría inválida');
      }
    }

    
    const datosActualizados: Partial<Unidad> = { ...updateUnidadDto };
    // 2. Eliminamos manualmente todas las propiedades que NO pertenecen a la tabla Unidad
    delete (datosActualizados as any).placa;
    delete (datosActualizados as any).fotos_eliminar;

    // 3. Mantenemos tus lógicas de chasis y auditoría intactas
    datosActualizados.num_chasis = num_chasis ? num_chasis.toUpperCase().trim() : unidadOriginal.num_chasis;
    datosActualizados.UpdatedId = userId;

    if (id_categoria) {
      datosActualizados.id_categoria = id_categoria;
    }

    
    await queryRunner.manager.update(
      Unidad,
      { id_unidad: unidadOriginal.id_unidad },
      datosActualizados
    );

    await queryRunner.commitTransaction();
    return await this.findOne(placa);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

  async remove(placa: string, userId: number): Promise<Unidad> {
    const unidad = await this.findOne(placa);
    unidad.status = false;
    unidad.UpdatedId = userId;
    return this.unidadRepository.save(unidad);
  }
}