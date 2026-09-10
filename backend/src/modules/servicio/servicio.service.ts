import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Brackets } from 'typeorm';
import { Servicio, EstadoPago, EstadoServicio, Moneda, OperacionFleteAdicional } from './entities/servicio.entity';
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
import { parseDateOnlyBolivia } from './date-utils';
import { Embarque } from '../embarque/entities/embarque.entity';

@Injectable()
export class ServicioService {
  constructor(
    @InjectRepository(Servicio) private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(FotoFactura) private readonly fotoFacturaRepo: Repository<FotoFactura>,
    private readonly asignacionService: AsignacionService,
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private async reservarEmbarque(idEmbarque: number, queryRunner: any, userId: number): Promise<Embarque> {
    const embarque = await queryRunner.manager.findOne(Embarque, {
      where: { id_embarque: idEmbarque, status: true },
      lock: { mode: 'pessimistic_write' },
    });
    if (!embarque || !embarque.visible || embarque.unidades_restantes <= 0) {
      throw new ConflictException('El CRT seleccionado no tiene viajes disponibles');
    }
    embarque.unidades_restantes -= 1;
    embarque.visible = embarque.unidades_restantes > 0;
    embarque.UpdatedId = userId;
    return queryRunner.manager.save(Embarque, embarque);
  }

  private async liberarEmbarque(idEmbarque: number, queryRunner: any, userId: number) {
    const embarque = await queryRunner.manager.findOne(Embarque, {
      where: { id_embarque: idEmbarque, status: true },
      lock: { mode: 'pessimistic_write' },
    });
    if (!embarque) return;
    embarque.unidades_restantes = Math.min(embarque.total_unidades, embarque.unidades_restantes + 1);
    embarque.visible = true;
    embarque.UpdatedId = userId;
    await queryRunner.manager.save(Embarque, embarque);
  }

 
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

      if (dto.fecha_pago && !files?.vaucher?.[0]) {
        throw new BadRequestException('Si registra una fecha de pago, debe subir el comprobante (voucher).');
      }
      if (files?.vaucher?.[0] && !dto.fecha_pago) {
        throw new BadRequestException('Si sube un comprobante (voucher), debe registrar la fecha de pago.');
      }

      const categoria = await queryRunner.manager.findOne(CategoriaEntidad, { where: { id_categoria: dto.id_categoria } });
      const esInternacional = categoria?.tipo_categoria?.toUpperCase().includes('INTERNACIONAL') ?? false;

      if (esInternacional && !dto.id_embarque) {
        throw new BadRequestException('El embarque y CRT son obligatorios para viajes internacionales');
      }
      // La validación de factura es más compleja y se maneja mejor en el frontend al finalizar.
      // if (dto.es_facturado === 'si' && !files?.foto_factura?.length) {
      //   throw new BadRequestException('Si el viaje está facturado, debes subir al menos una foto de factura');
      // }
      const fechaInicioDate = parseDateOnlyBolivia(dto.fecha_inicio);
      const fechaFinDate = dto.fecha_fin ? parseDateOnlyBolivia(dto.fecha_fin) : null;

      if (fechaFinDate && fechaInicioDate && fechaFinDate < fechaInicioDate) {
        throw new BadRequestException('La fecha fin no puede ser menor a la fecha inicio');
      }
      if (dto.fecha_fin && (!dto.periodo_liquidacion || Number(dto.periodo_liquidacion) <= 0)) {
        throw new BadRequestException('El período de liquidación es obligatorio cuando el viaje tiene fecha de finalización');
      }

      // 2. PREPARACIÓN DE DATOS Y ESTADOS
      const {
        ids_requisitos_aduaneros, // Excluir del spread
        es_facturado,
        facturas: facturasPayload,
        fecha_pago,
        crt: _crt,
        operacion_flete_adicional,
        ...restOfDto
      } = dto;
      const fInicio = fechaInicioDate ?? new Date();
      const estadoServicio = dto.fecha_fin ? EstadoServicio.FINALIZADO : EstadoServicio.EN_CURSO;
      let fLimitePago: Date | null = null;
      if (dto.fecha_fin && fechaFinDate) {
        fLimitePago = new Date(fechaFinDate);
        fLimitePago.setDate(fLimitePago.getDate() + (dto.periodo_liquidacion || 0));
      }
      const fPago = dto.fecha_pago ? parseDateOnlyBolivia(dto.fecha_pago) : null;
      const montoBase = Number(dto.flete);
      const montoExtra = Number(dto.flete_adicional || 0);
      const operacion: OperacionFleteAdicional = operacion_flete_adicional || OperacionFleteAdicional.SUMA;
      const montoExtraCalculado = operacion === OperacionFleteAdicional.SUMA ? montoExtra : -montoExtra;
      const tCambio = dto.moneda === Moneda.DOLAR ? Number(dto.tipo_cambio || 1) : 1;
      const fleteTotalBs = (montoBase + montoExtraCalculado) * tCambio;

      let urlVoucher: string | undefined = undefined;
      if (files?.vaucher?.[0]) {
        const { url } = await this.cloudinaryService.subirArchivo(files.vaucher[0], 'yuriana/vouchers');
        urlVoucher = url;
      }

      // 3. CREACIÓN DE ENTIDADES
      const servicio = queryRunner.manager.create(Servicio, {
        ...restOfDto,
        fecha_inicio: fInicio,
        fecha_fin: fechaFinDate,
        fecha_pago: fPago,
        operacion_flete_adicional: operacion, // Se asegura que el valor (incluyendo el default 'SUMA') se guarde
        periodo_liquidacion: dto.periodo_liquidacion || 0,
        tipo_cambio: dto.moneda === Moneda.DOLAR ? Number(dto.tipo_cambio) : 1,
        total_flete: fleteTotalBs,
        fecha_limite_pago: fLimitePago,
        estado_servicio: estadoServicio,
        estado_pago: (urlVoucher || fPago) ? EstadoPago.PAGADO : EstadoPago.PENDIENTE,
        comprobante_pago: urlVoucher,
mes: (fInicio.getMonth() + 1).toString().padStart(2, '0'),
          anio: fInicio.getFullYear(),
        fecha_registro: new Date(),
        CreatedId: userId,
        codigo_servicio: `TEMP-${Date.now()}`,
      });

      const guardado = await queryRunner.manager.save(servicio);
      if (dto.id_embarque) {
        const embarque = await this.reservarEmbarque(dto.id_embarque, queryRunner, userId);
        guardado.embarque = embarque;
        guardado.id_embarque = embarque.id_embarque;
        guardado.crt = embarque.crt;
        await queryRunner.manager.save(guardado);
      }
      guardado.codigo_servicio = `YUR-${guardado.id_servicio}`;
      await queryRunner.manager.save(guardado);

      let facturasNuevas: any[] = [];
      if (facturasPayload) {
        try {
          facturasNuevas = JSON.parse(String(facturasPayload));
        } catch {
          throw new BadRequestException('El formato de las facturas no es válido');
        }
        if (!Array.isArray(facturasNuevas)) {
          throw new BadRequestException('El listado de facturas no es válido');
        }
      } else if (dto.es_facturado === 'si') {
        facturasNuevas = [{
          factura_transporte: dto.factura_transporte,
          monto_factura: dto.monto_factura || fleteTotalBs,
          transmitido: true,
          foto_indices: (files?.foto_factura ?? []).map((_, indice) => indice),
        }];
      }

      for (const datosFactura of facturasNuevas) {
        const fechaEmisionDate = datosFactura.fecha_emision ? (parseDateOnlyBolivia(datosFactura.fecha_emision) ?? new Date()) : new Date();
        const factura = queryRunner.manager.create(Factura, {
          id_servicio: guardado.id_servicio,
          factura_transporte: String(datosFactura.factura_transporte ?? ''),
          monto_factura: Number(datosFactura.monto_factura ?? fleteTotalBs),
          transmitido: datosFactura.transmitido !== false,
          fecha_emision: fechaEmisionDate,
          mes: (fechaEmisionDate.getMonth() + 1).toString().padStart(2, '0'),
          anio: fechaEmisionDate.getFullYear(),
          CreatedId: userId,
        });
        const facturaGuardada = await queryRunner.manager.save(factura);
        const archivos = facturasPayload ? files?.facturas_fotos : files?.foto_factura;
        const indicesFotos = Array.isArray(datosFactura.foto_indices) ? datosFactura.foto_indices : [];
        for (const indiceFoto of indicesFotos) {
          const file = archivos?.[Number(indiceFoto)];
          if (!file) continue;
          const { url } = await this.cloudinaryService.subirArchivo(file, 'yuriana/facturas');
          await queryRunner.manager.save(FotoFactura, { id_factura: facturaGuardada.id_factura, url_foto: url, CreatedId: userId });
        }
      }

      if (files?.documentacion_aduanera && dto.ids_requisitos_aduaneros) {
        const idsRequisitos = String(dto.ids_requisitos_aduaneros).split(',').map(Number);

        for (let i = 0; i < files.documentacion_aduanera.length; i++) {
          const file = files.documentacion_aduanera[i];
          const idReq = idsRequisitos[i];

          if (!idReq || isNaN(idReq)) continue;

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
      return this.findOne(guardado.id_servicio); // Retorna el servicio completamente cargado

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
      .leftJoinAndSelect('servicio.facturas', 'factura')
      .andWhere('factura.status = :status', { status: true })
      .where('servicio.status = :status', { status: true });

    if (filters.buscar) {
      query.andWhere(new Brackets(qb => {
        qb.where('servicio.codigo_servicio ILIKE :b', { b: `%${filters.buscar}%` })
          .orWhere('tracto.placa ILIKE :b', { b: `%${filters.buscar}%` });
      }));
    }

    if (filters.id_categoria) query.andWhere('servicio.id_categoria = :cat', { cat: filters.id_categoria });
    if (filters.estado_pago) query.andWhere('servicio.estado_pago = :ep', { ep: filters.estado_pago });
    if (filters.estado_servicio) query.andWhere('servicio.estado_servicio = :es', { es: filters.estado_servicio });
    if (filters.operador) query.andWhere('servicio.operador = :op', { op: filters.operador });

    if (filters.facturado !== undefined) {
      if (filters.facturado === 'si') {
        query.andWhere('factura.id_factura IS NOT NULL AND factura.status = true');
      } else {
        query.andWhere('(factura.id_factura IS NULL OR factura.status = false)');
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
      relations: ['categoria', 'cliente', 'cliente.persona', 'asignacion', 'asignacion.conductor.persona', 'asignacion.tracto', 'asignacion.tracto.categoria', 'asignacion.tracto.documentos', 'asignacion.tracto.documentos.requisito_documento', 'asignacion.remolque', 'colaborador', 'colaborador.persona', 'facturas', 'facturas.fotos', 'documentos','documentos.requisito_documento','documentos.requisito_documento.categoria', 'embarque']
    });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    
    // Filtrar solo facturas con status true (activas)
    if (servicio.facturas) {
      servicio.facturas = servicio.facturas.filter(factura => factura.status === true);
    }
    
    return servicio;
  }

  async update(
    id: number,
    dto: UpdateServicioDto,
    files: { foto_factura?: Express.Multer.File[], facturas_fotos?: Express.Multer.File[], documentacion_aduanera?: Express.Multer.File[], vaucher?: Express.Multer.File[] },
    userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const servicio = await queryRunner.manager.findOne(Servicio, {
        where: { id_servicio: id, status: true },
        relations: ['asignacion', 'embarque'],
      });
      if (!servicio) throw new NotFoundException('Servicio no encontrado');

      const tieneVoucherNuevo = !!files?.vaucher?.[0];
      const tieneFechaPagoNueva = !!dto.fecha_pago;

      // Validación cruzada para voucher y fecha de pago en la actualización
      if (tieneVoucherNuevo && !tieneFechaPagoNueva && !servicio.fecha_pago) {
        throw new BadRequestException('Si sube un nuevo comprobante (voucher), también debe registrar la fecha de pago.');
      }
      if (tieneFechaPagoNueva && !tieneVoucherNuevo && !servicio.comprobante_pago) {
        throw new BadRequestException('Si registra una nueva fecha de pago, también debe subir el comprobante (voucher).');
      }

      const oldAsignacion = servicio.asignacion;
      const oldEstadoServicio = servicio.estado_servicio;
      const { borrar_fecha_fin, fecha_pago, facturas, facturas_actualizar, facturas_eliminar, es_facturado, factura_transporte, monto_factura, id_embarque, crt: _crt, ...datosActualizar } = dto;
      const debeBorrarFechaFin = String(borrar_fecha_fin) === 'true';

      if (String(borrar_fecha_fin) === 'true' && dto.fecha_fin) {
        throw new BadRequestException('No se puede borrar y establecer la fecha de fin al mismo tiempo');
      }

      const fechaInicioFinal = dto.fecha_inicio ? parseDateOnlyBolivia(dto.fecha_inicio) ?? servicio.fecha_inicio : servicio.fecha_inicio;
      const fechaFinFinal = debeBorrarFechaFin ? null : (dto.fecha_fin ? parseDateOnlyBolivia(dto.fecha_fin) ?? servicio.fecha_fin : servicio.fecha_fin);

      servicio.fecha_inicio = fechaInicioFinal;
      servicio.fecha_fin = fechaFinFinal;

      const nuevoIdEmbarque = id_embarque === undefined ? servicio.id_embarque : id_embarque;
      const categoriaActualizada = dto.id_categoria
        ? await queryRunner.manager.findOne(CategoriaEntidad, { where: { id_categoria: dto.id_categoria } })
        : await queryRunner.manager.findOne(CategoriaEntidad, { where: { id_categoria: servicio.id_categoria } });
      const viajeInternacional = categoriaActualizada?.tipo_categoria?.toUpperCase().includes('INTERNACIONAL') ?? false;
      if (viajeInternacional && !nuevoIdEmbarque) {
        throw new BadRequestException('El embarque y CRT son obligatorios para viajes internacionales');
      }
      if (nuevoIdEmbarque !== servicio.id_embarque) {
        if (servicio.id_embarque) await this.liberarEmbarque(servicio.id_embarque, queryRunner, userId);
        if (nuevoIdEmbarque) {
          const embarque = await this.reservarEmbarque(nuevoIdEmbarque, queryRunner, userId);
          servicio.embarque = embarque;
          servicio.id_embarque = embarque.id_embarque;
          servicio.crt = embarque.crt;
        } else {
          servicio.embarque = null;
          servicio.id_embarque = null;
          servicio.crt = null;
        }
      }

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

      // Si se proporciona una fecha de pago, actualizar el estado a PAGADO
      if (dto.fecha_pago) {
        servicio.fecha_pago = parseDateOnlyBolivia(dto.fecha_pago) ?? new Date();
        servicio.estado_pago = EstadoPago.PAGADO;
      }

      let facturasNuevas: any[] = [];
      if (dto.facturas) {
        try {
          facturasNuevas = JSON.parse(String(dto.facturas));
        } catch {
          throw new BadRequestException('El formato de las facturas no es válido');
        }
        if (!Array.isArray(facturasNuevas)) throw new BadRequestException('El listado de facturas no es válido');
      }

      const fechaBaseCalendario = dto.fecha_inicio
        ? String(dto.fecha_inicio).slice(0, 10)
        : servicio.fecha_inicio instanceof Date
          ? `${servicio.fecha_inicio.getFullYear()}-${(servicio.fecha_inicio.getMonth() + 1).toString().padStart(2, '0')}-${servicio.fecha_inicio.getDate().toString().padStart(2, '0')}`
          : String(servicio.fecha_inicio).slice(0, 10);
      const fechaEmisionBase = new Date(`${fechaBaseCalendario}T12:00:00`);
      for (const datosFactura of facturasNuevas) {
        const factura = await queryRunner.manager.save(Factura, queryRunner.manager.create(Factura, {
          id_servicio: id,
          factura_transporte: String(datosFactura.factura_transporte ?? ''),
          monto_factura: Number(datosFactura.monto_factura ?? servicio.total_flete),
          transmitido: datosFactura.transmitido !== false,
          fecha_emision: datosFactura.fecha_emision ?? fechaEmisionBase,
          mes: (fechaEmisionBase.getMonth() + 1).toString().padStart(2, '0'),
          anio: fechaEmisionBase.getFullYear(),
          CreatedId: userId,
        }));
        const indicesFotos = Array.isArray(datosFactura.foto_indices) ? datosFactura.foto_indices : [];
        for (const indiceFoto of indicesFotos) {
          const file = files?.facturas_fotos?.[Number(indiceFoto)];
          if (!file) continue;
          const { url } = await this.cloudinaryService.subirArchivo(file, 'yuriana/facturas');
          await queryRunner.manager.save(FotoFactura, { id_factura: factura.id_factura, url_foto: url, CreatedId: userId });
        }
      }

      if (facturas_actualizar) {
        let actualizaciones: any[];
        try { actualizaciones = JSON.parse(String(facturas_actualizar)); } catch { throw new BadRequestException('El formato de actualización de facturas no es válido'); }
        for (const datosFactura of actualizaciones) {
          if (!datosFactura.id_factura) continue;
          const facturaActualizada = await queryRunner.manager.findOne(Factura, { where: { id_factura: Number(datosFactura.id_factura), id_servicio: id, status: true } });
          if (!facturaActualizada) continue;
          await queryRunner.manager.update(Factura, { id_factura: facturaActualizada.id_factura }, {
            factura_transporte: String(datosFactura.factura_transporte ?? ''),
            monto_factura: Number(datosFactura.monto_factura ?? servicio.total_flete),
            transmitido: datosFactura.transmitido !== false,
            fecha_emision: datosFactura.fecha_emision ? (parseDateOnlyBolivia(datosFactura.fecha_emision) ?? facturaActualizada.fecha_emision) : facturaActualizada.fecha_emision,
            UpdatedId: userId,
          });
          const indicesFotos = Array.isArray(datosFactura.foto_indices) ? datosFactura.foto_indices : [];
          for (const indiceFoto of indicesFotos) {
            const file = files?.facturas_fotos?.[Number(indiceFoto)];
            if (!file) continue;
            const { url } = await this.cloudinaryService.subirArchivo(file, 'yuriana/facturas');
            await queryRunner.manager.save(FotoFactura, { id_factura: facturaActualizada.id_factura, url_foto: url, CreatedId: userId });
          }
          const fotosAEliminar = Array.isArray(datosFactura.fotos_eliminar)
            ? datosFactura.fotos_eliminar.map(Number).filter((fotoId: number) => !isNaN(fotoId))
            : [];
          if (fotosAEliminar.length) {
            await queryRunner.manager.delete(FotoFactura, fotosAEliminar.map((id_foto_factura) => ({
              id_foto_factura,
              id_factura: facturaActualizada.id_factura,
            })));
          }
        }
      }
      if (facturas_eliminar) {
        const ids = String(facturas_eliminar).split(',').map(Number).filter((value) => !isNaN(value));
        if (ids.length) await queryRunner.manager.update(Factura, ids.map((id_factura) => ({ id_factura, id_servicio: id, status: true })), { status: false, UpdatedId: userId });
      }

      if (files?.documentacion_aduanera && dto.ids_requisitos_aduaneros) {
        const idsRequisitos = String(dto.ids_requisitos_aduaneros).split(',').map(Number);
        for (let i = 0; i < files.documentacion_aduanera.length; i++) {
          const file = files.documentacion_aduanera[i];
          const idReq = idsRequisitos[i];
          if (!idReq || isNaN(idReq)) continue;
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
        servicio.fecha_fin = parseDateOnlyBolivia(dto.fecha_fin) ?? new Date();
        servicio.estado_servicio = EstadoServicio.FINALIZADO;
        const fLimite = new Date(servicio.fecha_fin);
        fLimite.setDate(fLimite.getDate() + (dto.periodo_liquidacion ?? servicio.periodo_liquidacion ?? 0));
        servicio.fecha_limite_pago = fLimite;
      }

      Object.assign(servicio, { ...datosActualizar, UpdatedId: userId });

      // Estos campos deben permanecer nulos al reabrir el servicio.
      if (debeBorrarFechaFin) {
        servicio.fecha_fin = null;
        servicio.periodo_liquidacion = null;
        servicio.fecha_limite_pago = null;
        servicio.estado_servicio = EstadoServicio.EN_CURSO;
      }

      // Recalcular el flete total
      const montoBase = Number(servicio.flete);
      const montoExtra = Number(servicio.flete_adicional ?? 0);
      const operacion = servicio.operacion_flete_adicional || OperacionFleteAdicional.SUMA;
      const montoExtraCalculado = operacion === OperacionFleteAdicional.SUMA ? montoExtra : -montoExtra;
      const tCambio = servicio.moneda === Moneda.DOLAR ? Number(servicio.tipo_cambio ?? 1) : 1;
      servicio.total_flete = (montoBase + montoExtraCalculado) * tCambio;

      const fechaEmisionServicio = new Date(
        fechaInicioFinal.getFullYear(),
        fechaInicioFinal.getMonth(),
        fechaInicioFinal.getDate(),
        12,
        0,
        0,
      );
      await queryRunner.manager.update(Factura, { id_servicio: id, status: true }, {
        fecha_emision: fechaEmisionServicio,
        mes: (fechaInicioFinal.getMonth() + 1).toString().padStart(2, '0'),
        anio: fechaInicioFinal.getFullYear(),
        UpdatedId: userId,
      });

      
      const asignacionCambio = servicio.id_asignacion !== oldAsignacion.id_asignacion;

      if (asignacionCambio) {
        const newAsignacion = await this.validateAsignacion(servicio.id_asignacion, queryRunner);
        servicio.asignacion = newAsignacion;
      }

      await queryRunner.manager.save(servicio);

      if (asignacionCambio) {
        if (oldEstadoServicio === EstadoServicio.EN_CURSO) {
          await this.liberarEquipo(oldAsignacion, userId, queryRunner);
        }
        if (servicio.estado_servicio === EstadoServicio.EN_CURSO) {
          await this.ocuparEquipo(servicio.asignacion, userId, queryRunner); // Ahora 'servicio.asignacion' es el nuevo.
        }
      } else {
        if (oldEstadoServicio === EstadoServicio.EN_CURSO && servicio.estado_servicio === EstadoServicio.FINALIZADO) {
          await this.liberarEquipo(oldAsignacion, userId, queryRunner);
        } else if (oldEstadoServicio === EstadoServicio.FINALIZADO && servicio.estado_servicio === EstadoServicio.EN_CURSO) {
          await this.ocuparEquipo(oldAsignacion, userId, queryRunner);
        }
      }

      await queryRunner.commitTransaction();

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
        relations: ['asignacion', 'embarque'],
      });
      if (!servicio) throw new NotFoundException('Servicio no encontrado');

      if (servicio.estado_pago === EstadoPago.RETRASADO) {
        throw new BadRequestException('No se puede eliminar un viaje con el pago retrasado');
      }
      if (servicio.estado_servicio === EstadoServicio.EN_CURSO) {
        await this.liberarEquipo(servicio.asignacion, userId, queryRunner);
      }
      if (servicio.id_embarque) await this.liberarEmbarque(servicio.id_embarque, queryRunner, userId);

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
        .where('s.status = true AND s.estado_pago IN (:...estados) AND EXTRACT(MONTH FROM s.fecha_inicio) = :mes AND EXTRACT(YEAR FROM s.fecha_inicio) = :anio', { estados: ['PENDIENTE', 'RETRASADO'], mes: mesParam, anio: anioParam })
        .getRawOne(),
      this.servicioRepo.createQueryBuilder('s').select('COALESCE(SUM(s.total_flete), 0)', 'total')
        .where('s.status = true AND s.estado_pago = :estado AND EXTRACT(MONTH FROM s.fecha_inicio) = :mes AND EXTRACT(YEAR FROM s.fecha_inicio) = :anio', { estado: EstadoPago.PAGADO, mes: mesParam, anio: anioParam })
        .getRawOne(),
      this.servicioRepo.createQueryBuilder('s').select('COALESCE(SUM(s.total_flete), 0)', 'total')
        .where('s.status = true AND s.estado_pago = :estado AND EXTRACT(MONTH FROM s.fecha_inicio) = :mes AND EXTRACT(YEAR FROM s.fecha_inicio) = :anio', { estado: EstadoPago.RETRASADO, mes: mesParam, anio: anioParam })
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