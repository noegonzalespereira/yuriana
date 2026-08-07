import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Brackets } from 'typeorm';
import { Servicio, EstadoPago, EstadoServicio, Moneda } from './entities/servicio.entity';
import { CategoriaEntidad } from '../categoria-entidad/entities/categoria-entidad.entity';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { Factura } from '../facturacion/entities/facturacion.entity';
import { FotoFactura } from '../facturacion/entities/foto-factura.entity';
import { Documento } from '../documento/entities/documento.entity';
import { Conductor, EstadoOperativo } from '../conductor/entities/conductor.entity';
import { Unidad, EstadoUnidad } from '../unidad/entities/unidad.entity';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { FilterServicioDto } from './dto/filter-servicio.dto';
import { AsignacionService } from '../asignacion/asignacion.service';
import { Asignacion, EstadoAsignacion } from '../asignacion/entities/asignacion.entity';

@Injectable()
export class ServicioService {
  constructor(
    @InjectRepository(Servicio) private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(FotoFactura) private readonly fotoFacturaRepo: Repository<FotoFactura>,
    private readonly asignacionService: AsignacionService,
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

 
  private async validateAsignacion(id_asignacion: number, queryRunner: any): Promise<Asignacion> {
    const asignacion = await queryRunner.manager.findOne(Asignacion, { where: { id_asignacion, status: true } });
    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }
    if (asignacion.estado_asignacion === EstadoAsignacion.ASIGNADO) {
      throw new ConflictException('La asignación ya está en uso por otro servicio activo');
    }
    return asignacion;
  }
  
  
  private async ocuparEquipo(asignacion: Asignacion, userId: number, queryRunner: any) {
    await queryRunner.manager.update(Asignacion, asignacion.id_asignacion, { estado_asignacion: EstadoAsignacion.ASIGNADO, UpdatedId: userId });
    await queryRunner.manager.update(Conductor, asignacion.id_conductor, { estado_operativo: EstadoOperativo.VIAJE, UpdatedId: userId });
    await queryRunner.manager.update(Unidad,
      [asignacion.id_tracto, asignacion.id_remolque],
      { estado_unidad: EstadoUnidad.EN_VIAJE, UpdatedId: userId },
    );
  }

  
  private async liberarEquipo(asignacion: Asignacion, userId: number, queryRunner: any) {
    await queryRunner.manager.update(Asignacion, asignacion.id_asignacion, {
      estado_asignacion: EstadoAsignacion.ACTIVA,
      UpdatedId: userId,
    });
    await queryRunner.manager.update(Conductor, asignacion.id_conductor, {
      estado_operativo: EstadoOperativo.ASIGNADO, 
      UpdatedId: userId,
    });
    await queryRunner.manager.update(Unidad, [asignacion.id_tracto, asignacion.id_remolque], {
      estado_unidad: EstadoUnidad.ASIGNADO, 
      UpdatedId: userId,
    });
  }
 

  async create(dto: CreateServicioDto, files: any, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. VALIDACIONES DE ENTRADA
      const asignacion = await this.validateAsignacion(dto.id_asignacion, queryRunner);

      const categoria = await queryRunner.manager.findOne(CategoriaEntidad, { where: { id_categoria: dto.id_categoria } });
      const esInternacional = categoria?.tipo_categoria?.toUpperCase().includes('INTERNACIONAL') ?? false;

      if (esInternacional && !dto.crt?.trim()) {
        throw new BadRequestException('El CRT es obligatorio para viajes internacionales');
      }
      if (dto.es_facturado === 'si' && !files?.foto_factura?.length) {
        throw new BadRequestException('Si el viaje está facturado, debes subir al menos una foto de factura');
      }
      if (dto.fecha_fin && new Date(dto.fecha_fin) < new Date(dto.fecha_inicio)) {
        throw new BadRequestException('La fecha fin no puede ser menor a la fecha inicio');
      }
      if (dto.fecha_fin && (!dto.periodo_liquidacion || Number(dto.periodo_liquidacion) <= 0)) {
        throw new BadRequestException('El período de liquidación es obligatorio cuando el viaje tiene fecha de finalización');
      }

      // 2. PREPARACIÓN DE DATOS Y ESTADOS
      // FIX: Interpretar la fecha como local para evitar el desfase de zona horaria.
      const fInicio = new Date(`${dto.fecha_inicio}T00:00:00`);
      const estadoServicio = dto.fecha_fin ? EstadoServicio.FINALIZADO : EstadoServicio.EN_CURSO;
      let fLimitePago: Date | null = null;
      if (dto.fecha_fin) {
        const fFin = new Date(`${dto.fecha_fin}T00:00:00`);
        fLimitePago = new Date(fFin);
        fLimitePago.setDate(fFin.getDate() + (dto.periodo_liquidacion || 0));
      }

      const montoBase = Number(dto.flete);
      const montoExtra = Number(dto.flete_adicional || 0);
      const tCambio = dto.moneda === Moneda.DOLAR ? Number(dto.tipo_cambio || 1) : 1;
      const fleteTotalBs = (montoBase + montoExtra) * tCambio;

      let urlVoucher: string | undefined = undefined;
      if (files?.vaucher?.[0]) {
        const { url } = await this.cloudinaryService.subirArchivo(files.vaucher[0], 'yuriana/vouchers');
        urlVoucher = url;
      }

      // 3. CREACIÓN DE ENTIDADES
      const servicio = queryRunner.manager.create(Servicio, {
        ...dto,

        periodo_liquidacion: dto.periodo_liquidacion || 0,
        tipo_cambio: dto.moneda === Moneda.DOLAR ? Number(dto.tipo_cambio) : 1,
        total_flete: fleteTotalBs,
        fecha_limite_pago: fLimitePago,
        estado_servicio: estadoServicio,
        estado_pago: urlVoucher ? EstadoPago.PAGADO : EstadoPago.PENDIENTE,
        comprobante_pago: urlVoucher,
        mes: (fInicio.getMonth() + 1).toString().padStart(2, '0'),
        anio: fInicio.getFullYear(),
        fecha_registro: new Date(),
        CreatedId: userId,
        codigo_servicio: `TEMP-${Date.now()}`,
      });

      const guardado = await queryRunner.manager.save(servicio);
      guardado.codigo_servicio = `YUR-${guardado.id_servicio}`;
      await queryRunner.manager.save(guardado);

      if (dto.es_facturado === 'si') {
        const factura = queryRunner.manager.create(Factura, {
          id_servicio: guardado.id_servicio,
          factura_transporte: String(dto.factura_transporte ?? ''),
          monto_factura: dto.monto_factura || fleteTotalBs,
          fecha_emision: fInicio,
          mes: (fInicio.getMonth() + 1).toString().padStart(2, '0'),
          anio: fInicio.getFullYear(),
          CreatedId: userId,
        });
        const facturaGuardada = await queryRunner.manager.save(factura);

        if (files?.foto_factura?.length) {
          for (const file of files.foto_factura) {
            const { url } = await this.cloudinaryService.subirArchivo(file, 'yuriana/facturas');
            await queryRunner.manager.save(FotoFactura, {
              id_factura: facturaGuardada.id_factura,
              url_foto: url,
              CreatedId: userId,
            });
          }
        }
      }

      if (files?.documentacion_aduanera && dto.ids_requisitos_aduaneros) {
        const idsRequisitos = dto.ids_requisitos_aduaneros ?? [];

        for (let i = 0; i < files.documentacion_aduanera.length; i++) {
          const file = files.documentacion_aduanera[i];
          const idReq = idsRequisitos[i];

          if (isNaN(idReq)) continue;

          const { url } = await this.cloudinaryService.subirArchivo(file, 'yuriana/documentos/servicio');
          await queryRunner.manager.save(Documento, {
            id_requisito: idReq,
            id_servicio: guardado.id_servicio,
            url_documento: url,
            tipo_documento: file.mimetype,
            CreatedId: userId,
          });
        }
      }

      // 4. EFECTO DOMINÓ: Actualización de estados de equipo
      if (estadoServicio === EstadoServicio.EN_CURSO) {
        await this.ocuparEquipo(asignacion, userId, queryRunner);
      } 

      await queryRunner.commitTransaction();
      return guardado;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async marcarRetrasados() {
    await this.servicioRepo
      .createQueryBuilder()
      .update(Servicio)
      .set({ estado_pago: EstadoPago.RETRASADO })
      .where('fecha_limite_pago < :now', { now: new Date() })
      .andWhere('estado_pago = :pendiente', { pendiente: EstadoPago.PENDIENTE })
      .andWhere('status = :status', { status: true })
      .andWhere('fecha_limite_pago IS NOT NULL')
      .execute();
  }

  async findAll(filters: FilterServicioDto): Promise<Servicio[]> {
    await this.marcarRetrasados();
    const query = this.servicioRepo
      .createQueryBuilder('servicio')
      .leftJoinAndSelect('servicio.categoria', 'categoriaServicio')
      .leftJoinAndSelect('servicio.cliente', 'cliente')
      .leftJoinAndSelect('cliente.persona', 'personaCliente')
      .leftJoinAndSelect('servicio.asignacion', 'asignacion')
      .leftJoinAndSelect('asignacion.conductor', 'conductor')
      .leftJoinAndSelect('conductor.persona', 'personaConductor')
      .leftJoinAndSelect('asignacion.tracto', 'tracto')
      .leftJoinAndSelect('servicio.colaborador', 'colaborador')
      .leftJoinAndSelect('servicio.documentos', 'documento') 
      .leftJoinAndSelect('documento.requisito_documento', 'requisito') // Documento -> Requisito
      .leftJoinAndSelect('requisito.categoria', 'categoriaRequisito')  // Requisito -> Categoría
      .leftJoin('factura', 'factura', 'factura.id_servicio = servicio.id_servicio')
      .addSelect('factura.id_factura', 'id_factura') 
      .where('servicio.status = :status', { status: true });

    if (filters.buscar) {
      query.andWhere(new Brackets(qb => {
        qb.where('servicio.codigo_servicio ILIKE :b', { b: `%${filters.buscar}%` })
          .orWhere('servicio.origen ILIKE :b', { b: `%${filters.buscar}%` })
          .orWhere('servicio.destino ILIKE :b', { b: `%${filters.buscar}%` });
      }));
    }

    if (filters.id_categoria) query.andWhere('servicio.id_categoria = :cat', { cat: filters.id_categoria });
    if (filters.estado_pago) query.andWhere('servicio.estado_pago = :ep', { ep: filters.estado_pago });
    if (filters.estado_servicio) query.andWhere('servicio.estado_servicio = :es', { es: filters.estado_servicio });
    if (filters.operador) query.andWhere('servicio.operador = :op', { op: filters.operador });

    if (filters.facturado !== undefined) {
      if (filters.facturado === 'si') {
        query.andWhere('factura.id_factura IS NOT NULL');
      } else {
        query.andWhere('factura.id_factura IS NULL');
      }
    }

    if (filters.fecha_inicio && filters.fecha_fin) {
      query.andWhere('servicio.fecha_inicio BETWEEN :f1 AND :f2', { f1: filters.fecha_inicio, f2: filters.fecha_fin });
    }

    return await query.orderBy('servicio.createdAt', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Servicio> {
    const servicio = await this.servicioRepo.findOne({
      where: { id_servicio: id, status: true },
      relations: ['categoria', 'cliente', 'cliente.persona', 'asignacion', 'asignacion.conductor.persona', 'asignacion.tracto', 'asignacion.tracto.categoria', 'asignacion.tracto.documentos', 'asignacion.tracto.documentos.requisito_documento', 'asignacion.remolque', 'colaborador', 'colaborador.persona', 'factura', 'factura.fotos', 'documentos','documentos.requisito_documento','documentos.requisito_documento.categoria']
    });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    return servicio;
  }

  async update(
    id: number,
    dto: UpdateServicioDto,
    files: { foto_factura?: Express.Multer.File[], documentacion_aduanera?: Express.Multer.File[], vaucher?: Express.Multer.File[] },
    userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const servicio = await queryRunner.manager.findOne(Servicio, {
        where: { id_servicio: id, status: true },
        relations: ['asignacion'],
      });
      if (!servicio) throw new NotFoundException('Servicio no encontrado');

      const { borrar_fecha_fin, ...datosActualizar } = dto;
      const debeBorrarFechaFin = String(borrar_fecha_fin) === 'true';
      const estadoAnterior = servicio.estado_servicio;

      if (debeBorrarFechaFin && dto.fecha_fin) {
        throw new BadRequestException('No se puede borrar y establecer la fecha de fin al mismo tiempo');
      }

      // FIX: Interpretar la fecha como local para evitar el desfase de zona horaria.
      const fechaInicioFinal = dto.fecha_inicio ? new Date(`${dto.fecha_inicio}T00:00:00`) : servicio.fecha_inicio;
      const fechaFinFinal = debeBorrarFechaFin ? null : (dto.fecha_fin ? new Date(`${dto.fecha_fin}T00:00:00`) : servicio.fecha_fin);

      if (fechaFinFinal && fechaFinFinal < fechaInicioFinal) {
        throw new BadRequestException('La fecha fin no puede ser menor a la fecha inicio');
      }

      if (dto.fecha_fin && !servicio.fecha_fin) {
        const periodoFinal = dto.periodo_liquidacion ?? servicio.periodo_liquidacion;
        if (!periodoFinal || Number(periodoFinal) <= 0) {
          throw new BadRequestException('El período de liquidación es obligatorio al finalizar un viaje');
        }
      }

      if (dto.ids_fotos_eliminar) {
        const ids = String(dto.ids_fotos_eliminar).split(',').map(Number).filter(n => !isNaN(n));
        if (ids.length > 0) await queryRunner.manager.delete(FotoFactura, ids);
      }

      if (files?.vaucher?.[0]) {
        const { url } = await this.cloudinaryService.subirArchivo(files.vaucher[0], 'yuriana/vouchers');
        servicio.comprobante_pago = url;
        servicio.estado_pago = EstadoPago.PAGADO;
      }

      if (dto.es_facturado === 'si' && files?.foto_factura?.length) {
        let factura = await queryRunner.manager.findOne(Factura, { where: { id_servicio: id } });
        if (!factura) {
          factura = queryRunner.manager.create(Factura, {
            id_servicio: id,
            factura_transporte: String(dto.factura_transporte ?? ''),
            monto_factura: dto.monto_factura || servicio.total_flete,
            fecha_emision: servicio.fecha_inicio,
            mes: (servicio.fecha_inicio.getMonth() + 1).toString().padStart(2, '0'),
            anio: servicio.fecha_inicio.getFullYear(),
            CreatedId: userId,
          });
          await queryRunner.manager.save(factura);
        }
        for (const file of files.foto_factura) {
          const { url } = await this.cloudinaryService.subirArchivo(file, 'yuriana/facturas');
          await queryRunner.manager.save(FotoFactura, {
            id_factura: factura.id_factura,
            url_foto: url,
            CreatedId: userId,
          });
        }
      }

      if (files?.documentacion_aduanera && dto.ids_requisitos_aduaneros) {
        const idsRequisitos = dto.ids_requisitos_aduaneros ?? [];
        for (let i = 0; i < files.documentacion_aduanera.length; i++) {
          const file = files.documentacion_aduanera[i];
          const idReq = idsRequisitos[i];
          if (isNaN(idReq)) continue;
          const { url } = await this.cloudinaryService.subirArchivo(file, 'yuriana/documentos/servicio');
          await queryRunner.manager.save(Documento, {
            id_requisito: idReq,
            id_servicio: id,
            url_documento: url,
            tipo_documento: file.mimetype,
            CreatedId: userId,
          });
        }
      }


      if (debeBorrarFechaFin) {
        servicio.fecha_fin = null;
        servicio.fecha_limite_pago = null;
        servicio.estado_servicio = EstadoServicio.EN_CURSO;
      } else if (dto.fecha_fin) {
        servicio.fecha_fin = new Date(`${dto.fecha_fin}T00:00:00`);
        servicio.estado_servicio = EstadoServicio.FINALIZADO;
        const fLimite = new Date(servicio.fecha_fin);
        fLimite.setDate(fLimite.getDate() + (dto.periodo_liquidacion ?? servicio.periodo_liquidacion ?? 0));
        servicio.fecha_limite_pago = fLimite;
      }

      // Recalcular el flete total
      const montoBase = Number(dto.flete ?? servicio.flete);
      const montoExtra = Number(dto.flete_adicional ?? servicio.flete_adicional ?? 0);
      const tCambio = (dto.moneda ?? servicio.moneda) === Moneda.DOLAR ? Number(dto.tipo_cambio ?? servicio.tipo_cambio ?? 1) : 1;
      servicio.total_flete = (montoBase + montoExtra) * tCambio;

      Object.assign(servicio, { ...datosActualizar, UpdatedId: userId });
      await queryRunner.manager.save(servicio);

      // Lógica de transición de estados
      const guardado = servicio; // Use the current instance for state transition logic
      if (estadoAnterior === EstadoServicio.EN_CURSO && guardado.estado_servicio === EstadoServicio.FINALIZADO) {
        await this.liberarEquipo(servicio.asignacion, userId, queryRunner);
      } else if (estadoAnterior === EstadoServicio.FINALIZADO && guardado.estado_servicio === EstadoServicio.EN_CURSO) {
        await this.ocuparEquipo(servicio.asignacion, userId, queryRunner);
      } else if (guardado.estado_servicio === EstadoServicio.FINALIZADO && servicio.asignacion.estado_asignacion !== EstadoAsignacion.ACTIVA) {
       
        console.log(`Saneando asignación #${servicio.id_asignacion} para servicio finalizado #${guardado.id_servicio}`);
        await this.liberarEquipo(servicio.asignacion, userId, queryRunner);
      }

      await queryRunner.commitTransaction();

      // Devolver la entidad completa con todas sus relaciones para actualizar el frontend correctamente
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const servicio = await queryRunner.manager.findOne(Servicio, {
        where: { id_servicio: id, status: true },
        relations: ['asignacion'],
      });
      if (!servicio) throw new NotFoundException('Servicio no encontrado');

      if (servicio.estado_pago === EstadoPago.RETRASADO) {
        throw new BadRequestException('No se puede eliminar un viaje con el pago retrasado');
      }
      if (servicio.estado_servicio === EstadoServicio.EN_CURSO) {
        await this.liberarEquipo(servicio.asignacion, userId, queryRunner);
      }

      servicio.status = false;
      servicio.UpdatedId = userId;
      const guardado = await queryRunner.manager.save(servicio);

      await queryRunner.commitTransaction();
      return guardado;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async contador(filters?: { fecha_inicio?: string, fecha_fin?: string }) {
    await this.marcarRetrasados();
    
    const buildQuery = (estado_servicio?: EstadoServicio, estado_pago?: EstadoPago) => {
      const qb = this.servicioRepo.createQueryBuilder('servicio').where('servicio.status = true');
      if (estado_servicio) qb.andWhere('servicio.estado_servicio = :es', { es: estado_servicio });
      if (estado_pago) qb.andWhere('servicio.estado_pago = :ep', { ep: estado_pago });
      if (filters?.fecha_inicio && filters?.fecha_fin) {
        qb.andWhere('servicio.fecha_inicio BETWEEN :f1 AND :f2', { f1: filters.fecha_inicio, f2: filters.fecha_fin });
      }
      return qb;
    };

    const en_curso = await buildQuery(EstadoServicio.EN_CURSO).getCount();
    const pendientes = await buildQuery(undefined, EstadoPago.PENDIENTE).getCount();
    const retrasados = await buildQuery(undefined, EstadoPago.RETRASADO).getCount();

    return { en_curso, pendientes, retrasados };
  }

  async totalesPagos(mes?: string, anio?: number) {
    await this.marcarRetrasados();
    const now = new Date();
    const mesParam = mes || (now.getMonth() + 1).toString().padStart(2, '0');
    const anioParam = anio || now.getFullYear();

    const [porCobrar, cobrado, retrasado] = await Promise.all([
      this.servicioRepo.createQueryBuilder('s').select('COALESCE(SUM(s.total_flete), 0)', 'total')
        .where('s.status = true AND s.estado_pago IN (:...estados) AND s.mes = :mes AND s.anio = :anio', { estados: ['PENDIENTE', 'RETRASADO'], mes: mesParam, anio: anioParam })
        .getRawOne(),
      this.servicioRepo.createQueryBuilder('s').select('COALESCE(SUM(s.total_flete), 0)', 'total')
        .where('s.status = true AND s.estado_pago = :estado AND s.mes = :mes AND s.anio = :anio', { estado: EstadoPago.PAGADO, mes: mesParam, anio: anioParam })
        .getRawOne(),
      this.servicioRepo.createQueryBuilder('s').select('COALESCE(SUM(s.total_flete), 0)', 'total')
        .where('s.status = true AND s.estado_pago = :estado AND s.mes = :mes AND s.anio = :anio', { estado: EstadoPago.RETRASADO, mes: mesParam, anio: anioParam })
        .getRawOne(),
    ]);

    return {
      total_por_cobrar: +Number(porCobrar?.total || 0).toFixed(2),
      total_cobrado: +Number(cobrado?.total || 0).toFixed(2),
      total_retrasado: +Number(retrasado?.total || 0).toFixed(2),
    };
  }

  async findRecientes(limit = 10) {
    return this.dataSource.query(
      `SELECT s.id_servicio, s.codigo_servicio, s.origen, s.destino,
              s.total_flete, s.fecha_inicio, s.fecha_fin,
              s.estado_pago, s.estado_servicio,
              cl.razon_social AS cliente_nombre,
              p.nombre        AS conductor_nombre,
              u.placa         AS tracto_placa,
              u2.placa        AS remolque_placa,
              cat.tipo_categoria
       FROM servicio s
       LEFT JOIN cliente cl          ON s.id_cliente    = cl.id_cliente
       LEFT JOIN asignacion_unidad a ON s.id_asignacion = a.id_asignacion
       LEFT JOIN conductor c         ON a.id_conductor  = c.id_conductor
       LEFT JOIN persona p           ON c.id_persona    = p.id_persona
       LEFT JOIN unidad u            ON a.id_tracto     = u.id_unidad
       LEFT JOIN unidad u2           ON a.id_remolque   = u2.id_unidad
       LEFT JOIN categoria_entidad cat ON s.id_categoria = cat.id_categoria
       WHERE s.status = true
       ORDER BY s."createdAt" DESC
       LIMIT $1`,
      [limit],
    );
  }
}