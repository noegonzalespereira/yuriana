// backend/src/modules/unidad/unidad.service.ts

import { ConflictException, BadRequestException, NotFoundException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Unidad, EstadoUnidad } from './entities/unidad.entity';
import { CategoriaEntidadService } from '../categoria-entidad/categoria-entidad.service';
import { TipoCategoria } from '../categoria-entidad/entities/categoria-entidad.entity';
import { DocumentoService } from '../documento/documento.service';
import { FilterUnidadDto } from './dto/filter-unidad.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { FotoUnidad } from '../foto_unidad/entities/foto-unidad.entity';
import { Documento } from '../documento/entities/documento.entity';
import { RequisitoDocumento } from '../requisito-documento/entities/requisito-documento.entity';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { UpdateUnidadDto } from './dto/update-unidad.dto';

@Injectable()
export class UnidadService {
  constructor(
    @InjectRepository(Unidad) private unidadRepository: Repository<Unidad>,
    @InjectRepository(FotoUnidad) private fotoUnidadRepository: Repository<FotoUnidad>,
    private categoriaEntidadService: CategoriaEntidadService,
    private documentoService: DocumentoService,
    private cloudinaryService: CloudinaryService,
    private dataSource: DataSource,
  ) {}

  // backend/src/modules/unidad/unidad.service.ts

async registrarConDocumentos(
  createUnidadDto: CreateUnidadDto,
  fotosFiles: Express.Multer.File[],
  docArchivos: Express.Multer.File[],
  fechas: Record<number, string>,
  userId: number,
) {
  const placaNormalizada = createUnidadDto.placa.toUpperCase().trim();
  const numChasisNormalizado = createUnidadDto.num_chasis.toUpperCase().trim();

  const existe_placa = await this.unidadRepository.findOneBy({ placa: placaNormalizada, status: true });
  if (existe_placa) throw new ConflictException('Placa ya registrada');

  const existe_chasis = await this.unidadRepository.findOneBy({ num_chasis: numChasisNormalizado, status: true });
  if (existe_chasis) throw new ConflictException('Número de chasis ya registrado');

  const categoria = await this.categoriaEntidadService.findOne(createUnidadDto.id_categoria);
  const categoriasValidas = [TipoCategoria.TRACTO, TipoCategoria.SEMIREMOLQUE, TipoCategoria.REMOLQUE];
  if (!categoriasValidas.includes(categoria.tipo_categoria)) {
    throw new BadRequestException('La categoría debe ser Tracto, Semiremolque o Remolque');
  }

  // 1. Subida simultánea en paralelo de fotografías operativas (RAM -> Cloudinary)
  const promesasFotos = fotosFiles.map(file => this.cloudinaryService.subirArchivo(file, 'yuriana/unidades/fotos'));
  const fotosResultados = await Promise.all(promesasFotos);
  const fotosSubidas = fotosResultados.map(r => r.url);

  // 2. Subida simultánea blindada de expedientes digitales controlando el NaN
  const docSubidos: { idRequisito: number; url: string; mimetype: string }[] = [];
  
  if (docArchivos && docArchivos.length > 0) {
    for (const file of docArchivos) {
      // Control defensivo: si el fieldname no contiene el prefijo, buscamos la clave en el pool de fechas
      let idRequisitoRaw = file.fieldname.replace('archivo_', '');
      let idRequisito = parseInt(idRequisitoRaw, 10);

      // Si el parseo falló (NaN), recuperamos el ID basándonos en las llaves del mapa de fechas asociadas
      if (isNaN(idRequisito)) {
        const llavesFechas = Object.keys(fechas).map(Number);
        // Emparejamos posicionalmente o asignamos la llave correspondiente
        idRequisito = llavesFechas[docSubidos.length] || createUnidadDto.id_categoria;
      }

      const { url } = await this.cloudinaryService.subirArchivo(file, 'yuriana/documentos/unidad');
      docSubidos.push({ idRequisito, url, mimetype: file.mimetype });
    }
  }

  // 3. Inicio del bloque transaccional atómico seguro en Supabase
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const nuevaUnidad = queryRunner.manager.create(Unidad, {
      ...createUnidadDto,
      placa: placaNormalizada,
      num_chasis: numChasisNormalizado,
      categoria,
      CreatedId: userId,
    });
    const unidadGuardada = await queryRunner.manager.save(Unidad, nuevaUnidad);

    const fotoRepo = queryRunner.manager.getRepository(FotoUnidad);
    for (const url of fotosSubidas) {
      const foto = fotoRepo.create({ id_unidad: unidadGuardada.id_unidad, url_foto: url, CreatedId: userId });
      await fotoRepo.save(foto);
    }

    for (const docInfo of docSubidos) {
      const requisito = await queryRunner.manager.findOne(RequisitoDocumento, {
        where: { id_requisito_documento: docInfo.idRequisito },
      });
      
      const fechaStr = fechas[docInfo.idRequisito];
      const fecha_vencimiento = requisito?.requiere_vencimiento && fechaStr
        ? new Date(fechaStr)
        : undefined;

      const documento = queryRunner.manager.create(Documento, {
        id_requisito: docInfo.idRequisito,
        url_documento: docInfo.url,
        tipo_documento: docInfo.mimetype,
        id_unidad: unidadGuardada.id_unidad,
        fecha_vencimiento,
        CreatedId: userId,
      });
      await queryRunner.manager.save(Documento, documento);
    }

    await queryRunner.commitTransaction();
    return await this.findOne(placaNormalizada);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    const todasLasUrls = [...fotosSubidas, ...docSubidos.map(d => d.url)];
    await Promise.allSettled(todasLasUrls.map(url => this.cloudinaryService.eliminarArchivo(url)));
    throw error;
  } finally {
    await queryRunner.release();
  }
}
  async create(createUnidadDto: CreateUnidadDto, files: Express.Multer.File[], userId: number): Promise<Unidad> {
    const placaNormalizada = createUnidadDto.placa.toUpperCase();
    const numChasisNormalizado = createUnidadDto.num_chasis.toUpperCase();
    
    const existe_placa = await this.unidadRepository.findOneBy({ placa: placaNormalizada, status: true });
    if (existe_placa) throw new ConflictException('Placa ya registrada');

    const existe_chasis = await this.unidadRepository.findOneBy({ num_chasis: numChasisNormalizado, status: true });
    if (existe_chasis) throw new ConflictException('Número de chasis ya registrado');

    const categoria = await this.categoriaEntidadService.findOne(createUnidadDto.id_categoria);
    if (![TipoCategoria.TRACTO, TipoCategoria.SEMIREMOLQUE, TipoCategoria.REMOLQUE].includes(categoria.tipo_categoria)) {
      throw new BadRequestException('La categoría debe ser Tracto, Semiremolque o Remolque');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const nuevaUnidad = this.unidadRepository.create({ ...createUnidadDto, placa: placaNormalizada, num_chasis: numChasisNormalizado, categoria, CreatedId: userId });
      const unidadGuardada = await queryRunner.manager.save(nuevaUnidad);

      if (files && files.length > 0) {
        const fotoRepoTransaccional = queryRunner.manager.getRepository(FotoUnidad);
        // Paralelización de fotos individuales
        const promesas = files.map(file => this.cloudinaryService.subirArchivo(file, 'yuriana/unidades/fotos'));
        const resultados = await Promise.all(promesas);

        for (const res of resultados) {
          const fotoRegistro = fotoRepoTransaccional.create({ id_unidad: unidadGuardada.id_unidad, url_foto: res.url, CreatedId: userId });
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
    if (filters.placa) query.andWhere('unidad.placa LIKE :placa', { placa: `%${filters.placa.toUpperCase()}%` });

    const unidades = await query.orderBy('unidad.createdAt', 'DESC').getMany();
    return await Promise.all(
      unidades.map(async (unidad) => {
        unidad.fotos = (unidad.fotos || []).filter(f => f.status === true);
        const estadoDoc = await this.documentoService.getEstadoDocumentosPorEntidad(unidad.id_unidad, 'unidad');
        return { ...unidad, ...estadoDoc };
      }),
    );
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
    const unidadOriginal = await this.findOne(placa);
    const { id_categoria, num_chasis } = updateUnidadDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fotoRepo = queryRunner.manager.getRepository(FotoUnidad);
      if (fotosEliminarIds.length > 0) {
        for (const idFoto of fotosEliminarIds) {
          await fotoRepo.update({ id_foto: idFoto, id_unidad: unidadOriginal.id_unidad }, { status: false, UpdatedId: userId });
        }
      }
      if (files && files.length > 0) {
        const promesas = files.map(file => this.cloudinaryService.subirArchivo(file, 'yuriana/unidades/fotos'));
        const resultados = await Promise.all(promesas);
        for (const res of resultados) {
          const nuevaFoto = fotoRepo.create({ id_unidad: unidadOriginal.id_unidad, url_foto: res.url, CreatedId: userId });
          await fotoRepo.save(nuevaFoto);
        }
      }

      const datosActualizados: Partial<Unidad> = { ...updateUnidadDto };
      delete (datosActualizados as any).placa;
      delete (datosActualizados as any).fotos_eliminar;
      datosActualizados.num_chasis = num_chasis ? num_chasis.toUpperCase().trim() : unidadOriginal.num_chasis;
      datosActualizados.UpdatedId = userId;
      if (id_categoria) datosActualizados.id_categoria = id_categoria;

      await queryRunner.manager.update(Unidad, { id_unidad: unidadOriginal.id_unidad }, datosActualizados);
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
    if (unidad.estado_unidad === EstadoUnidad.ASIGNADO || unidad.estado_unidad === EstadoUnidad.EN_VIAJE) {
      throw new ForbiddenException(`No se puede eliminar la unidad "${unidad.placa}" porque está en estado ${unidad.estado_unidad}`);
    }
    unidad.status = false;
    unidad.UpdatedId = userId;
    return this.unidadRepository.save(unidad);
  }
}