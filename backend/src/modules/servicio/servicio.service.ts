import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Brackets } from 'typeorm';
import { Servicio, EstadoPago, EstadoServicio, Moneda } from './entities/servicio.entity';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { Factura } from '../facturacion/entities/facturacion.entity';
import { Conductor, EstadoOperativo } from '../conductor/entities/conductor.entity';
import { Unidad, EstadoUnidad } from '../unidad/entities/unidad.entity';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { FilterServicioDto } from './dto/filter-servicio.dto';
import { ClienteService } from '../cliente/cliente.service';
import { ColaboradorService } from '../colaborador/colaborador.service';
import { AsignacionService } from '../asignacion/asignacion.service';
import { DocumentoService } from '../documento/documento.service';

@Injectable()
export class ServicioService {
  constructor(
    @InjectRepository(Servicio) private readonly servicioRepo: Repository<Servicio>,
    private readonly asignacionService: AsignacionService,
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
    private readonly clienteService: ClienteService,
    private readonly colaboradorService: ColaboradorService,
    private readonly documentoService: DocumentoService, // Inyectamos tu servicio de documentos
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
      const servicio = queryRunner.manager.create(Servicio, {
        ...dto,
        
        periodo_liquidacion: dto.periodo_liquidacion || 0,
        tipo_cambio: dto.moneda === Moneda.DOLAR ? Number(dto.tipo_cambio) : 1,
        total_flete: fleteTotalBs,
        fecha_limite_pago: fLimitePago,
        estado_servicio: estadoServicio,
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
      if (dto.es_facturado === 'si' && files?.foto_factura) {
        const { url } = await this.cloudinaryService.subirArchivo(files.foto_factura[0], 'yuriana/facturas');
        const factura = queryRunner.manager.create(Factura, {
          id_servicio: guardado.id_servicio,
          factura_transporte: parseInt(dto.factura_transporte!),
          monto_factura: dto.monto_factura || fleteTotalBs,
          foto_factura: url,
          fecha_emision: fInicio,
          mes: mesNombre,
          anio: anioVal,
          CreatedId: userId,
        });
        await queryRunner.manager.save(factura);
      }

      // 6. GESTIÓN DE DOCUMENTOS (Aquí llamamos a tu DocumentoService)
      if (files?.documentacion_aduanera && dto.ids_requisitos_aduaneros) {
        // Normalizamos los IDs de requisitos (Postman los manda como string o array)
        const idsRequisitos = dto.ids_requisitos_aduaneros ?? [];

        for (let i = 0; i < files.documentacion_aduanera.length; i++) {
          const file = files.documentacion_aduanera[i];
          const idReq = idsRequisitos[i];

          if (isNaN(idReq)) continue;

          // Llamamos a tu servicio para que haga el insert con id_requisito obligatorio
          await this.documentoService.create(
            {
              id_requisito: idReq,
              id_servicio: guardado.id_servicio,
              // fecha_vencimiento: opcional desde el dto si lo añades
            },
            file,
            userId
          );
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

  // ... (findAll, findOne, update, remove, contador se mantienen iguales)
  
  async findAll(filters: FilterServicioDto): Promise<Servicio[]> {
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
      relations: ['categoria', 'cliente', 'cliente.persona', 'asignacion', 'asignacion.conductor.persona', 'asignacion.tracto', 'asignacion.remolque', 'colaborador.persona','documentos','documentos.requisito_documento','documentos.requisito_documento.categoria']
    });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    return servicio;
  }

  async update(id: number, dto: UpdateServicioDto, fileVoucher: Express.Multer.File, userId: number) {
    const servicio = await this.findOne(id);

    if (fileVoucher) {
      const { url } = await this.cloudinaryService.subirArchivo(fileVoucher, 'yuriana/vouchers');
      servicio.comprobante_pago = url;
      servicio.estado_pago = EstadoPago.PAGADO;
    }

    if (dto.fecha_fin) {
      servicio.fecha_fin = new Date(dto.fecha_fin);
      servicio.estado_servicio = EstadoServicio.FINALIZADO;
      const fLimite = new Date(servicio.fecha_fin);
      fLimite.setDate(fLimite.getDate() + (dto.periodo_liquidacion ?? servicio.periodo_liquidacion ?? 0));
      servicio.fecha_limite_pago = fLimite;
      await this.liberarEquipo(servicio.id_asignacion, userId);
    }

    Object.assign(servicio, { ...dto, UpdatedId: userId });
    return await this.servicioRepo.save(servicio);
  }

  async remove(id: number, userId: number) {
    const servicio = await this.findOne(id);
    await this.liberarEquipo(servicio.id_asignacion, userId);
    servicio.status = false;
    servicio.UpdatedId = userId;
    return await this.servicioRepo.save(servicio);
  }

  async contador() {
    const en_curso = await this.servicioRepo.count({ where: { status: true, estado_servicio: EstadoServicio.EN_CURSO } });
    const pendientes = await this.servicioRepo.count({ where: { status: true, estado_pago: EstadoPago.PENDIENTE } });
    const retrasados = await this.servicioRepo.count({ where: { status: true, estado_pago: EstadoPago.RETRASADO } });
    return { en_curso, pendientes, retrasados };
  }
}