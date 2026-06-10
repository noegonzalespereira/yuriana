import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class ServicioService {
  constructor(
    @InjectRepository(Servicio) private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(FotoFactura) private readonly fotoFacturaRepo: Repository<FotoFactura>,
    private readonly asignacionService: AsignacionService,
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private async liberarEquipo(id_asignacion: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const asignacion = await this.asignacionService.findOne(id_asignacion);
      if (asignacion) {
        await queryRunner.manager.update(Conductor, asignacion.id_conductor, {
          estado_operativo: EstadoOperativo.ASIGNADO,
          UpdatedId: userId,
        });
        await queryRunner.manager.update(Unidad, 
          [asignacion.id_tracto, asignacion.id_remolque], 
          { estado_unidad: EstadoUnidad.ASIGNADO, UpdatedId: userId }
        );
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async create(dto: CreateServicioDto, files: any, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. VALIDACIONES INICIALES
      const asig = await this.asignacionService.findOne(dto.id_asignacion);
      if (!asig) throw new NotFoundException('La asignación solicitada no existe');

      // 1b. VALIDACIONES CONTEXTUALES
      const categoria = await queryRunner.manager.findOne(CategoriaEntidad, { where: { id_categoria: dto.id_categoria } });
      const esInternacional = categoria?.tipo_categoria?.toUpperCase().includes('internacional') ?? false;

      if (esInternacional && !dto.crt?.trim()) {
        throw new BadRequestException('El CRT es obligatorio para viajes internacionales');
      }

      if (dto.fecha_fin) {
        if (!dto.periodo_liquidacion || Number(dto.periodo_liquidacion) <= 0) {
          throw new BadRequestException('El período de liquidación es obligatorio cuando el viaje tiene fecha de finalización');
        }
        if (dto.es_facturado === 'si' && !files?.foto_factura?.length) {
          throw new BadRequestException('Si el viaje está facturado, debes subir al menos una foto de factura');
        }
      }

      // 2. CÁLCULO DE FECHAS Y ESTADOS
      const fInicio = new Date(dto.fecha_inicio!);
      const mesNombre = (fInicio.getMonth() + 1).toString().padStart(2, '0');
      const anioVal = fInicio.getFullYear();

      let fLimitePago: Date | undefined = undefined;
      let estadoServicio = EstadoServicio.EN_CURSO;

      if (dto.fecha_fin) {
        const fFin = new Date(dto.fecha_fin);
        estadoServicio = EstadoServicio.FINALIZADO;
        fLimitePago = new Date(fFin);
        fLimitePago.setDate(fFin.getDate() + (dto.periodo_liquidacion || 0));
      }

      // 3. CÁLCULO FINANCIERO
      const montoBase = Number(dto.flete);
      const montoExtra = Number(dto.flete_adicional || 0);
      const tCambio = dto.moneda === Moneda.DOLAR ? Number(dto.tipo_cambio || 1) : 1;
      const fleteTotalBs = (montoBase + montoExtra) * tCambio;

      // 4. CREAR EL SERVICIO
      let urlVoucher: string | undefined = undefined;
      if (files?.vaucher?.[0]) {
        const { url } = await this.cloudinaryService.subirArchivo(files.vaucher[0], 'yuriana/vouchers');
        urlVoucher = url;
      }

      const servicio = queryRunner.manager.create(Servicio, {
        ...dto,

        periodo_liquidacion: dto.periodo_liquidacion || 0,
        tipo_cambio: dto.moneda === Moneda.DOLAR ? Number(dto.tipo_cambio) : 1,
        total_flete: fleteTotalBs,
        fecha_limite_pago: fLimitePago,
        estado_servicio: estadoServicio,
        estado_pago: urlVoucher ? EstadoPago.PAGADO : EstadoPago.PENDIENTE,
        comprobante_pago: urlVoucher,
        mes: mesNombre,
        anio: anioVal,
        fecha_registro: new Date(),
        CreatedId: userId,
        codigo_servicio: `TEMP-${Date.now()}`,
      });

      const guardado = await queryRunner.manager.save(servicio);
      guardado.codigo_servicio = `YUR-${guardado.id_servicio}`;
      await queryRunner.manager.save(guardado);

      // 5. FACTURACIÓN
      if (dto.es_facturado === 'si') {
        const factura = queryRunner.manager.create(Factura, {
          id_servicio: guardado.id_servicio,
          factura_transporte: String(dto.factura_transporte ?? ''),
          monto_factura: dto.monto_factura || fleteTotalBs,
          fecha_emision: fInicio,
          mes: mesNombre,
          anio: anioVal,
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

      // 6. GESTIÓN DE DOCUMENTOS dentro de la misma transacción
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

      // 7. EFECTO DOMINÓ
      if (estadoServicio === EstadoServicio.EN_CURSO) {
        await queryRunner.manager.update(Conductor, asig.id_conductor, { estado_operativo: EstadoOperativo.VIAJE });
        await queryRunner.manager.update(Unidad, [asig.id_tracto, asig.id_remolque], { estado_unidad: EstadoUnidad.EN_VIAJE });
      } else {
        await queryRunner.manager.update(Conductor, asig.id_conductor, { estado_operativo: EstadoOperativo.ASIGNADO });
        await queryRunner.manager.update(Unidad, [asig.id_tracto, asig.id_remolque], { estado_unidad: EstadoUnidad.ASIGNADO });
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
      relations: ['categoria', 'cliente', 'cliente.persona', 'asignacion', 'asignacion.conductor.persona', 'asignacion.tracto', 'asignacion.tracto.categoria', 'asignacion.remolque', 'colaborador', 'colaborador.persona', 'factura', 'factura.fotos', 'documentos','documentos.requisito_documento','documentos.requisito_documento.categoria']
    });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    return servicio;
  }

  async update(id: number, dto: UpdateServicioDto, fileVoucher: Express.Multer.File, userId: number) {
    const servicio = await this.findOne(id);


    // Validaciones cuando se está finalizando el viaje (se envía fecha_fin por primera vez)
    if (dto.fecha_fin && !servicio.fecha_fin) {
      const periodoFinal = dto.periodo_liquidacion ?? servicio.periodo_liquidacion;
      if (!periodoFinal || Number(periodoFinal) <= 0) {
        throw new BadRequestException('El período de liquidación es obligatorio al finalizar un viaje');
      }
    }

    // Eliminar fotos de factura si se solicita
    if (dto.ids_fotos_eliminar) {
      const ids = String(dto.ids_fotos_eliminar).split(',').map(Number).filter(n => !isNaN(n));
      if (ids.length > 0) await this.fotoFacturaRepo.delete(ids);
    }

    // Subir voucher si viene
    if (fileVoucher) {
      const { url } = await this.cloudinaryService.subirArchivo(fileVoucher, 'yuriana/vouchers');
      servicio.comprobante_pago = url;
      servicio.estado_pago = EstadoPago.PAGADO;
    }

    // Si se provee fecha_fin (o ya la tenía), finalizar el viaje
    if (dto.fecha_fin) {
      servicio.fecha_fin = new Date(dto.fecha_fin);
      servicio.estado_servicio = EstadoServicio.FINALIZADO;
      const fLimite = new Date(servicio.fecha_fin);
      fLimite.setDate(fLimite.getDate() + (dto.periodo_liquidacion ?? servicio.periodo_liquidacion ?? 0));
      servicio.fecha_limite_pago = fLimite;
      if (!servicio.fecha_fin) await this.liberarEquipo(servicio.id_asignacion, userId);
    }

    Object.assign(servicio, { ...dto, UpdatedId: userId });
    return await this.servicioRepo.save(servicio);
  }

  async remove(id: number, userId: number) {
    const servicio = await this.findOne(id);
    if (servicio.estado_pago === EstadoPago.PENDIENTE || servicio.estado_pago === EstadoPago.RETRASADO) {
      throw new BadRequestException('No se puede eliminar un viaje con estado de pago pendiente o retrasado');
    }
    await this.liberarEquipo(servicio.id_asignacion, userId);
    servicio.status = false;
    servicio.UpdatedId = userId;
    return await this.servicioRepo.save(servicio);
  }

  async contador() {
    await this.marcarRetrasados();
    const en_curso = await this.servicioRepo.count({ where: { status: true, estado_servicio: EstadoServicio.EN_CURSO } });
    const pendientes = await this.servicioRepo.count({ where: { status: true, estado_pago: EstadoPago.PENDIENTE } });
    const retrasados = await this.servicioRepo.count({ where: { status: true, estado_pago: EstadoPago.RETRASADO } });
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