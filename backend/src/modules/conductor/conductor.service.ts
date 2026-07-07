
import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { UpdateConductorDto } from './dto/update-conductor.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Conductor, EstadoLaboral, EstadoOperativo } from './entities/conductor.entity';
import { Persona } from '../persona/entities/persona.entity';
import { Documento } from '../documento/entities/documento.entity';
import { RequisitoDocumento } from '../requisito-documento/entities/requisito-documento.entity';
import { PersonaService } from '../persona/persona.service';
import { CategoriaEntidadService } from '../categoria-entidad/categoria-entidad.service';
import { FilterConductorDto } from './dto/filter-conductor.dto';
import { TipoCategoria } from '../categoria-entidad/entities/categoria-entidad.entity';
import { DocumentoService } from '../documento/documento.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class ConductorService {
  constructor(
    @InjectRepository(Conductor) private conductorRepository: Repository<Conductor>,
    private personaService: PersonaService,
    private categoriaEntidadService: CategoriaEntidadService,
    private documentoService: DocumentoService,
    private cloudinaryService: CloudinaryService,
    private dataSource: DataSource,
  ) {}

  async registrarConDocumentos(
    datosConductor: CreateConductorDto,
    archivos: Express.Multer.File[],
    fechas: Record<number, string>,
    userId: number,
  ): Promise<Conductor> {
    const categoriaEntidad = await this.categoriaEntidadService.findOneByNombre(TipoCategoria.CONDUCTOR);

    const promesasSubida = archivos.map(async (file) => {
      const idRequisito = parseInt(file.fieldname.replace('archivo_', ''), 10);
      const { url } = await this.cloudinaryService.subirArchivo(file, 'yuriana/documentos/conductor');
      return { idRequisito, url, mimetype: file.mimetype };
    });

    const archivosSubidos = await Promise.all(promesasSubida);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const persona = queryRunner.manager.create(Persona, {
        ci: datosConductor.ci,
        nombre: datosConductor.nombre,
        correo: datosConductor.correo,
        telefono: datosConductor.telefono,
        telefono2: datosConductor.telefono2,
        ciudad: datosConductor.ciudad,
        CreatedId: userId,
      });
      const personaGuardada = await queryRunner.manager.save(Persona, persona);

      const conductor = queryRunner.manager.create(Conductor, {
        persona: personaGuardada,
        categoria: categoriaEntidad,
        sueldo: datosConductor.sueldo,
        estado_operativo: datosConductor.estado_operativo,
        estado_laboral: datosConductor.estado_laboral,
        CreatedId: userId,
      });
      const conductorGuardado = await queryRunner.manager.save(Conductor, conductor);

      for (const archivoInfo of archivosSubidos) {
        const requisito = await queryRunner.manager.findOne(RequisitoDocumento, {
          where: { id_requisito_documento: archivoInfo.idRequisito },
        });
        const fechaStr = fechas[archivoInfo.idRequisito];
        const fecha_vencimiento = requisito?.requiere_vencimiento && fechaStr
          ? new Date(fechaStr)
          : undefined;

        const documento = queryRunner.manager.create(Documento, {
          id_requisito: archivoInfo.idRequisito,
          url_documento: archivoInfo.url,
          tipo_documento: archivoInfo.mimetype,
          id_conductor: conductorGuardado.id_conductor,
          fecha_vencimiento,
          CreatedId: userId,
        });
        await queryRunner.manager.save(Documento, documento);
      }

      await queryRunner.commitTransaction();
      return conductorGuardado;

    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      // Rollback defensivo en la nube
      await Promise.allSettled(
        archivosSubidos.map(a => this.cloudinaryService.eliminarArchivo(a.url))
      );
      // Convierte el error de constraint único de PostgreSQL en un mensaje amigable
      if (error?.code === '23505') {
        throw new ConflictException('El CI ingresado ya está registrado en el sistema');
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async create(createConductorDto: CreateConductorDto, userId: number): Promise<Conductor> {
    const { nombre, ci, correo, telefono, telefono2, ciudad, ...datosConductor } = createConductorDto;
    const nuevaPersona = await this.personaService.create({ nombre, ci, correo, telefono, telefono2, ciudad }, userId);
    const categoriaEntidad = await this.categoriaEntidadService.findOneByNombre(TipoCategoria.CONDUCTOR); 
    const nuevoConductor = this.conductorRepository.create({
      ...datosConductor,
      persona: nuevaPersona,
      categoria: categoriaEntidad,
      CreatedId: userId
    });
    return await this.conductorRepository.save(nuevoConductor);
  }

  async findAll(filters: FilterConductorDto): Promise<Conductor[]> {
    const query = this.conductorRepository
      .createQueryBuilder('conductor')
      .leftJoinAndSelect('conductor.persona', 'persona')
      .leftJoinAndSelect('conductor.categoria', 'categoria')
      .where('conductor.status = :status', { status: true });

    if (filters.ci) query.andWhere('CAST(persona.ci AS TEXT) LIKE :ci', { ci: `${filters.ci}%` });
    if (filters.nombre) query.andWhere('persona.nombre LIKE :nombre', { nombre: `%${filters.nombre}%` });
    if (filters.estado_laboral) query.andWhere('conductor.estado_laboral = :estado_laboral', { estado_laboral: filters.estado_laboral });
    if (filters.estado_operativo) query.andWhere('conductor.estado_operativo = :estado_operativo', { estado_operativo: filters.estado_operativo });

    const conductores = await query.orderBy('conductor.createdAt', 'DESC').getMany();
    const conductoresEnriquecidos = await Promise.all(
      conductores.map(async (conductor) => {
        const estadoDoc = await this.documentoService.getEstadoDocumentosPorEntidad(conductor.id_conductor, 'conductor');
        return { ...conductor, ...estadoDoc };
      }),
    );
    if (filters.estado_documentos) {
      return conductoresEnriquecidos.filter(c => c.estado === filters.estado_documentos);
    }
    return conductoresEnriquecidos;
  }

  async findOne(ci: number): Promise<Conductor> {
    const conductor = await this.conductorRepository.findOne({
      where: { persona: { ci, status: true }, status: true },
      relations: ['persona', 'categoria']
    });
    if (!conductor) throw new NotFoundException('Conductor no encontrado');
    return conductor;
  }

  async update(ci: number, updateConductorDto: UpdateConductorDto, userId: number) {
    const conductor = await this.findOne(ci);
    const { nombre, correo, telefono, telefono2, ciudad, ...datosConductor } = updateConductorDto;
    if (nombre || correo || telefono || telefono2 || ciudad) {
      await this.personaService.update(conductor.persona.id_persona, { nombre, correo, telefono, telefono2, ciudad }, userId);
    }
    Object.assign(conductor, { ...datosConductor, UpdatedId: userId });
    return this.conductorRepository.save(conductor);
  }

  async remove(ci: number, userId: number): Promise<Conductor> {
    const conductor = await this.findOne(ci);
    if (conductor.estado_operativo === EstadoOperativo.ASIGNADO || conductor.estado_operativo === EstadoOperativo.VIAJE) {
      throw new ForbiddenException(`No se puede eliminar al conductor "${conductor.persona?.nombre}" porque está en estado ${conductor.estado_operativo}`);
    }
    conductor.status = false;
    conductor.UpdatedId = userId;
    return this.conductorRepository.save(conductor);
  }

  async contador(): Promise<{ total: number; activos: number; inactivos: number }> {
    const total = await this.conductorRepository.count({ where: { status: true } });
    const activos = await this.conductorRepository.count({ where: { status: true, estado_laboral: EstadoLaboral.ACTIVO } });
    const inactivos = await this.conductorRepository.count({ where: { status: true, estado_laboral: EstadoLaboral.INACTIVO } });
    return { total, activos, inactivos };
  }
}