import { BadRequestException,ConflictException,Injectable,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Asignacion, EstadoAsignacion } from './entities/asignacion.entity';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { FilterAsignacionDto } from './dto/filter-asignacion.dto';
import { Conductor } from '../conductor/entities/conductor.entity';
import { EstadoOperativo, EstadoLaboral } from '../conductor/entities/conductor.entity';
import { Unidad } from '../unidad/entities/unidad.entity';
import { EstadoUnidad } from '../unidad/entities/unidad.entity';
import { TipoCategoria } from '../categoria-entidad/entities/categoria-entidad.entity';
import { DocumentoService } from '../documento/documento.service';
import { ConductorService } from '../conductor/conductor.service';
import { UnidadService } from '../unidad/unidad.service';
@Injectable()
export class AsignacionService {
  constructor(
    @InjectRepository(Asignacion)
    private asignacionRepository: Repository<Asignacion>,
    private readonly conductorService: ConductorService,
    private readonly unidadService: UnidadService,
    private readonly documentoService: DocumentoService,
    private dataSource: DataSource,
  ) {}

  async create(createAsignaciondto: CreateAsignacionDto, userId: number){
    const conductor = await this.conductorService.findOne(
      createAsignaciondto.ci_conductor,
    );

    if (conductor.estado_laboral !== EstadoLaboral.ACTIVO) {
      throw new BadRequestException('El conductor no está activo laboralmente');
    }

    if (conductor.estado_operativo !== EstadoOperativo.DISPONIBLE) {
      throw new ConflictException(
        `El conductor está "${conductor.estado_operativo}" — debe estar DISPONIBLE`
      );
    }

    const asignacionConductorExiste = await this.asignacionRepository.findOneBy({
      id_conductor: conductor.id_conductor,
      estado_asignacion: EstadoAsignacion.ACTIVA,
      status: true
    });

    if (asignacionConductorExiste) {
      throw new ConflictException('El conductor ya tiene una asignación activa');
    }


    const placaTractoNormalizada = createAsignaciondto.placa_tracto.toUpperCase();
    const tracto = await this.unidadService.findOne(placaTractoNormalizada);

    if (tracto.categoria.tipo_categoria !== TipoCategoria.TRACTO) {
      throw new BadRequestException(
        'La unidad seleccionada no es de tipo Tracto'
      );
 
    }

    if (tracto.estado_unidad !== EstadoUnidad.DISPONIBLE) {
      throw new ConflictException(
        `El tracto está "${tracto.estado_unidad}" — debe estar DISPONIBLE`
      );
    }

    const asignacionTractoExiste = await this.asignacionRepository.findOneBy({
      id_tracto: tracto.id_unidad,
      estado_asignacion: EstadoAsignacion.ACTIVA,
      status: true
    });

    if (asignacionTractoExiste) {
      throw new ConflictException('El tracto ya está asignado a otro conductor');
    }
    const placaRemolqueNormalizada = createAsignaciondto.placa_remolque.toUpperCase();

    const remolque = await this.unidadService.findOne(placaRemolqueNormalizada);

    const categoriasRemolqueValidas = [
      TipoCategoria.REMOLQUE,
      TipoCategoria.SEMIREMOLQUE
    ];

    if (!categoriasRemolqueValidas.includes(remolque.categoria.tipo_categoria)) {
      throw new BadRequestException(
        'La unidad seleccionada no es Remolque ni Semiremolque'
      );
    }

    if (remolque.estado_unidad !== EstadoUnidad.DISPONIBLE) {
      throw new ConflictException(
        `El remolque está "${remolque.estado_unidad}" — debe estar DISPONIBLE`
      );
    }

    const asignacionRemolqueExiste = await this.asignacionRepository.findOneBy({
      id_remolque: remolque.id_unidad,
      estado_asignacion: EstadoAsignacion.ACTIVA,
      status: true
    });

    if (asignacionRemolqueExiste) {
      throw new ConflictException('El remolque ya está asignado a otro conductor');
    }


    const [docsConductor, docsTracto, docsRemolque] = await Promise.all([
      this.documentoService.getEstadoDocumentosPorEntidad(
        conductor.id_conductor, 'conductor'
      ),
      this.documentoService.getEstadoDocumentosPorEntidad(
        tracto.id_unidad, 'unidad'
      ),
      this.documentoService.getEstadoDocumentosPorEntidad(
        remolque.id_unidad, 'unidad'
      ),
    ]);
 

    const alertas: any[] = [];
   

    const entidades = [
      { 
        docs: docsConductor, 
        entidad: 'conductor', 
        nombre: conductor.persona.nombre
      },
      { 
        docs: docsTracto,    
        entidad: 'tracto',    
        nombre: tracto.placa
      },
      { 
        docs: docsRemolque,  
        entidad: 'remolque',  
        nombre: remolque.placa
      },
    ];

    for (const { docs, entidad, nombre } of entidades) {
      if (docs.estado === 'vencido' || docs.estado === 'por_vencer') {
        alertas.push({
          entidad,      
          nombre,       
          documento: docs.documento_critico,  
          estado: docs.estado,  
          mensaje: docs.estado === 'vencido'
            ? `${nombre} tiene "${docs.documento_critico}" VENCIDO`
            : `${nombre} tiene "${docs.documento_critico}" próximo a vencer`
        });
      }

    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      
      const nuevaAsignacion = queryRunner.manager.create(Asignacion, {
        id_conductor: conductor.id_conductor,
        conductor,        
        id_tracto: tracto.id_unidad,
        tracto,           
        id_remolque: remolque.id_unidad,
        remolque,         
        estado_asignacion: EstadoAsignacion.ACTIVA,
        CreatedId: userId,
      });

      const asignacionGuardada = await queryRunner.manager.save(nuevaAsignacion);
     

      await queryRunner.manager.update(
        Conductor,                            
        { id_conductor: conductor.id_conductor },  
        { 
          estado_operativo: EstadoOperativo.ASIGNADO, 
          UpdatedId: userId                   
        }
      );
      

      await queryRunner.manager.update(
        Unidad,
        { id_unidad:tracto.id_unidad },
        { estado_unidad: EstadoUnidad.ASIGNADO, UpdatedId: userId }
      );

      await queryRunner.manager.update(
        Unidad,
        { id_unidad: remolque.id_unidad },
        { estado_unidad: EstadoUnidad.ASIGNADO, UpdatedId: userId }
      );

      await queryRunner.commitTransaction();
    

      return { 
        asignacion: asignacionGuardada, 
        alertas
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      

      throw error;


    } finally {
      await queryRunner.release();
      
    }
}
async findAll(filters: FilterAsignacionDto) {
  const query = this.asignacionRepository
    .createQueryBuilder('asignacion')
    .leftJoinAndSelect('asignacion.conductor', 'conductor')
    .leftJoinAndSelect('conductor.persona', 'persona')
    .leftJoinAndSelect('asignacion.tracto', 'tracto')
    .leftJoinAndSelect('tracto.categoria', 'categoria_tracto')
    .leftJoinAndSelect('asignacion.remolque', 'remolque')
    .leftJoinAndSelect('remolque.categoria', 'categoria_remolque')
    .where('asignacion.status = :status', { status: true });

  if (filters.estado_asignacion) {
    query.andWhere('asignacion.estado_asignacion = :estado', 
      { estado: filters.estado_asignacion }
    );
  } else {
    query.andWhere('asignacion.estado_asignacion = :estado', 
      { estado: EstadoAsignacion.ACTIVA }
    );
  }

  if (filters.ci_conductor) {
    query.andWhere('CAST(persona.ci AS VARCHAR) ILIKE :ci', { ci: `%${filters.ci_conductor}%` });
  }

  if (filters.placa_tracto) {
    query.andWhere('tracto.placa LIKE :placa_tracto', {
      placa_tracto: `%${filters.placa_tracto.toUpperCase()}%`
    });
  }

  if (filters.placa_remolque) {
    query.andWhere('remolque.placa LIKE :placa_remolque', {
      placa_remolque: `%${filters.placa_remolque.toUpperCase()}%`
    });
  }
  query.orderBy('asignacion.createdAt', 'DESC');
  const asignaciones = await query.getMany();
  return asignaciones;
}
async findOne(id_asignacion: number) {
  const asignacion = await this.asignacionRepository.findOne({
    where: { id_asignacion, estado_asignacion: EstadoAsignacion.ACTIVA,status: true },
    relations: [
      'conductor',          
      'conductor.persona',  
      'tracto',             
      'remolque'            
    ]
  });

  if (!asignacion) {
    throw new NotFoundException('Asignación no encontrada o eliminada');
  }

  return asignacion;
}
async remove(id_asignacion: number, userId: number) {


  const asignacion = await this.findOne(id_asignacion);

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await queryRunner.manager.update(
      Asignacion,
      { id_asignacion },
      { 
        status: false,
        UpdatedId: userId

      }
    );

    await queryRunner.manager.update(
      Conductor,
      { id_conductor: asignacion.id_conductor },
      { estado_operativo: EstadoOperativo.DISPONIBLE, UpdatedId: userId }
    );

    await queryRunner.manager.update(
      Unidad,
      { id_unidad: asignacion.id_tracto },
      { estado_unidad: EstadoUnidad.DISPONIBLE, UpdatedId: userId }
    );

    await queryRunner.manager.update(
      Unidad,
      { id_unidad: asignacion.id_remolque },
      { estado_unidad: EstadoUnidad.DISPONIBLE, UpdatedId: userId }
    );

    await queryRunner.commitTransaction();

    return { 
      mensaje: 'Enganche deshecho — conductor y unidades vuelven a DISPONIBLE' 
    };

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
  
}