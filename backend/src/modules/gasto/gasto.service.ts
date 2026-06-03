import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

// Entidades Centralizadas del Módulo
import { Gasto } from './entities/gasto.entity';
import { GastosServicio } from './entities/gasto-servicio.entity';
import { DetalleGastoServicio, TipoGastoServicio } from './entities/detalle-gasto-servicio.entity';
import { GastoOperativo, TipoGastoOperativo } from './entities/gasto-operativo.entity';
import { GastoAdministrativo, TipoGastoAdministrativo } from './entities/gasto-administrativo.entity';
import { GastoGeneral, TipoGastoGeneral } from './entities/gasto-general.entity';

// DTOs de Entrada y Filtros
import { CreateGastoBulkDto, TipoPestaña } from './dto/create-gasto-bulk.dto';
import { FilterGastoDto } from './dto/filter-gasto.dto';

// Servicios de Validación Cruzada (Cross-Module)
import { ServicioService } from '../servicio/servicio.service';
import { UnidadService } from '../unidad/unidad.service';

@Injectable()
export class GastosService {
  constructor(
    @InjectRepository(Gasto) private readonly gastoRepo: Repository<Gasto>,
    @InjectRepository(GastosServicio) private readonly gastosServicioRepo: Repository<GastosServicio>,
    @InjectRepository(DetalleGastoServicio) private readonly detalleGastoRepo: Repository<DetalleGastoServicio>,
    @InjectRepository(GastoOperativo) private readonly gastoOperativoRepo: Repository<GastoOperativo>,
    @InjectRepository(GastoAdministrativo) private readonly gastoAdminRepo: Repository<GastoAdministrativo>,
    @InjectRepository(GastoGeneral) private readonly gastoGeneralRepo: Repository<GastoGeneral>,
    
    private readonly servicioService: ServicioService,
    private readonly unidadService: UnidadService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * CREATE (Bulk): Procesa el botón "Guardar" de tus 4 formularios dinámicos
   */
  async procesarGastoPantalla(dto: CreateGastoBulkDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      switch (dto.tipo_pestaña) {
        
        case TipoPestaña.SERVICIO: {
          if (!dto.codigo_servicio) throw new BadRequestException('El código del servicio (YUR-X) es requerido');

          // Traducimos el código visible "YUR-4" al ID secuencial interno 4
          const idExtraido = parseInt(dto.codigo_servicio.toUpperCase().replace('YUR-', '').trim());
          if (isNaN(idExtraido)) throw new BadRequestException('Formato de código de servicio inválido');
          
          const viajeExistente = await this.servicioService.findOne(idExtraido);
          if (!viajeExistente) throw new NotFoundException('El servicio de transporte solicitado no existe');

          const tCambio = dto.tipo_cambio || 1;
          const viaticoOriginal = dto.viatico_entregado || 0;
          const viaticoEnBs = viaticoOriginal * tCambio;

          let acumuladoGastosOriginal = 0;
          dto.items.forEach(item => acumuladoGastosOriginal += Number(item.monto));
          
          const acumuladoGastosBs = acumuladoGastosOriginal * tCambio;
          const saldoRestanteOriginal = viaticoOriginal - acumuladoGastosOriginal;
          const saldoRestanteBs = saldoRestanteOriginal * tCambio;

          // Creamos la cabecera de la rendición del viaje
          const cabeceraGasto = queryRunner.manager.create(GastosServicio, {
            id_servicio: viajeExistente.id_servicio,
            tipo_cambio: tCambio,
            moneda: dto.moneda || 'bolivianos',
            viatico_entregado: viaticoOriginal,
            viatico_bs: viaticoEnBs,
            total_gastos: acumuladoGastosOriginal,
            total_gastos_bs: acumuladoGastosBs,
            saldo: saldoRestanteOriginal,
            saldo_bs: saldoRestanteBs,
            fecha_registro: new Date(),
            CreatedId: userId
          });
          const cabeceraGuardada = await queryRunner.manager.save(cabeceraGasto);

          // Insertamos todas las filas en el Detalle relacionándolas también a la tabla general Gasto
          for (const item of dto.items) {
            const fGasto = new Date(item.fecha);
            
            const gastoMaestro = queryRunner.manager.create(Gasto, {
              fecha: fGasto,
              mes: (fGasto.getMonth() + 1).toString().padStart(2, '0'),
              anio: fGasto.getFullYear(),
              descripcion: item.descripcion,
              monto: item.monto,
              CreatedId: userId
            });
            const gastoMaestroGuardado = await queryRunner.manager.save(gastoMaestro);

            const detalle = queryRunner.manager.create(DetalleGastoServicio, {
              id_gasto_servicio: cabeceraGuardada.id_gasto_servicio,
              id_gasto: gastoMaestroGuardado.id_gasto,
              tipo_gasto: item.tipo_gasto as TipoGastoServicio, // Casteo seguro de Enum
              monto_bs: item.monto * tCambio,
              CreatedId: userId
            });
            await queryRunner.manager.save(detalle);
          }
          break;
        }

        case TipoPestaña.OPERATIVO: {
          if (!dto.placa) throw new BadRequestException('La placa de la unidad es obligatoria');
          
          const unidadExistente = await this.unidadService.findOne(dto.placa);
          if (!unidadExistente) throw new NotFoundException('La unidad vehicular no existe');

          for (const item of dto.items) {
            const fGasto = new Date(item.fecha);

            const gastoMaestro = queryRunner.manager.create(Gasto, {
              fecha: fGasto,
              mes: (fGasto.getMonth() + 1).toString().padStart(2, '0'),
              anio: fGasto.getFullYear(),
              descripcion: item.descripcion,
              monto: item.monto,
              CreatedId: userId
            });
            const gastoMaestroGuardado = await queryRunner.manager.save(gastoMaestro);

            // CORRECCIÓN CLAVE: Pasamos la clase de entidad como primer parámetro para limpiar VS Code
            const gastoOp = queryRunner.manager.create(GastoOperativo, {
              id_unidad: unidadExistente.id_unidad,
              id_gasto: gastoMaestroGuardado.id_gasto,
              tipo_gasto: item.tipo_gasto as TipoGastoOperativo,
              CreatedId: userId
            });
            await queryRunner.manager.save(gastoOp);
          }
          break;
        }

        case TipoPestaña.ADMINISTRATIVO: {
          for (const item of dto.items) {
            const fGasto = new Date(item.fecha);

            const gastoMaestro = queryRunner.manager.create(Gasto, {
              fecha: fGasto,
              mes: (fGasto.getMonth() + 1).toString().padStart(2, '0'),
              anio: fGasto.getFullYear(),
              descripcion: item.descripcion,
              monto: item.monto,
              CreatedId: userId
            });
            const gastoMaestroGuardado = await queryRunner.manager.save(gastoMaestro);

            const gastoAdmin = queryRunner.manager.create(GastoAdministrativo, {
              id_gasto: gastoMaestroGuardado.id_gasto,
              tipo_gasto: item.tipo_gasto as TipoGastoAdministrativo,
              id_empresa: dto.id_empresa || 1,
              CreatedId: userId
            });
            await queryRunner.manager.save(gastoAdmin);
          }
          break;
        }

        case TipoPestaña.GENERAL: {
          for (const item of dto.items) {
            const fGasto = new Date(item.fecha);

            const gastoMaestro = queryRunner.manager.create(Gasto, {
              fecha: fGasto,
              mes: (fGasto.getMonth() + 1).toString().padStart(2, '0'),
              anio: fGasto.getFullYear(),
              descripcion: item.descripcion,
              monto: item.monto,
              CreatedId: userId
            });
            const gastoMaestroGuardado = await queryRunner.manager.save(gastoMaestro);

            const gastoGral = queryRunner.manager.create(GastoGeneral, {
              id_gasto: gastoMaestroGuardado.id_gasto,
              tipo_gasto: item.tipo_gasto as TipoGastoGeneral,
              id_empresa: dto.id_empresa || 1,
              CreatedId: userId
            });
            await queryRunner.manager.save(gastoGral);
          }
          break;
        }
      }

      await queryRunner.commitTransaction();
      return { success: true, message: 'Lote de egresos asentado correctamente en la contabilidad' };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * READ ALL (findAll): Carga los datos de las tablas aplicando búsquedas por texto inteligible e ILIKE
   */
  async obtenerRegistros(pestana: TipoPestaña, filters: FilterGastoDto) {
    if (pestana === TipoPestaña.SERVICIO) {
      const query = this.gastosServicioRepo.createQueryBuilder('gs')
        .leftJoinAndSelect('gs.servicio', 'servicio')
        .where('gs.status = :status', { status: true });

      if (filters.buscar) {
        query.andWhere('servicio.codigo_servicio ILIKE :b', { b: `%${filters.buscar}%` });
      }
      if (filters.fecha_inicio && filters.fecha_fin) {
        query.andWhere('gs.fecha_registro BETWEEN :f1 AND :f2', { f1: filters.fecha_inicio, f2: filters.fecha_fin });
      }
      return await query.orderBy('gs.createdAt', 'DESC').getMany();
    }

    if (pestana === TipoPestaña.OPERATIVO) {
      const query = this.gastoOperativoRepo.createQueryBuilder('go')
        .leftJoinAndSelect('go.gasto', 'gasto')
        .leftJoinAndSelect('go.unidad', 'unidad')
        .where('go.status = :status', { status: true });

      if (filters.buscar) {
        query.andWhere('unidad.placa ILIKE :b', { b: `%${filters.buscar}%` });
      }
      if (filters.tipo_gasto) {
        query.andWhere('go.tipo_gasto = :tg', { tg: filters.tipo_gasto });
      }
      if (filters.fecha_inicio && filters.fecha_fin) {
        query.andWhere('gasto.fecha BETWEEN :f1 AND :f2', { f1: filters.fecha_inicio, f2: filters.fecha_fin });
      }
      return await query.orderBy('gasto.fecha', 'DESC').getMany();
    }

    // Administrativos y Generales unificados
    const repo = pestana === TipoPestaña.ADMINISTRATIVO ? this.gastoAdminRepo : this.gastoGeneralRepo;
    const alias = pestana === TipoPestaña.ADMINISTRATIVO ? 'ga' : 'gg';

    const queryEgresos = repo.createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.gasto`, 'gasto')
      .where(`${alias}.status = :status`, { status: true });

    if (filters.fecha_inicio && filters.fecha_fin) {
      queryEgresos.andWhere('gasto.fecha BETWEEN :f1 AND :f2', { f1: filters.fecha_inicio, f2: filters.fecha_fin });
    }
    if (filters.buscar) {
      queryEgresos.andWhere('gasto.descripcion ILIKE :b', { b: `%${filters.buscar}%` });
    }
    return await queryEgresos.orderBy('gasto.fecha', 'DESC').getMany();
  }

  /**
   * READ ONE (findOne): Detalle individual para las acciones de auditoría (el ojo en tu interfaz)
   */
  async findOne(pestana: TipoPestaña, id: number) {
    let registro;
    if (pestana === TipoPestaña.SERVICIO) {
      registro = await this.gastosServicioRepo.findOne({ where: { id_gasto_servicio: id, status: true }, relations: ['servicio'] });
      if (registro) {
        (registro as any).detalles = await this.detalleGastoRepo.find({ where: { id_gasto_servicio: id, status: true }, relations: ['gasto'] });
      }
    } else if (pestana === TipoPestaña.OPERATIVO) {
      registro = await this.gastoOperativoRepo.findOne({ where: { id_gasto_operativo: id, status: true }, relations: ['gasto', 'unidad'] });
    } else if (pestana === TipoPestaña.ADMINISTRATIVO) {
      registro = await this.gastoAdminRepo.findOne({ where: { id_gasto_admin: id, status: true }, relations: ['gasto'] });
    } else {
      registro = await this.gastoGeneralRepo.findOne({ where: { id_gasto_general: id, status: true }, relations: ['gasto'] });
    }

    if (!registro) throw new NotFoundException('Gasto no encontrado');
    return registro;
  }

  /**
   * UPDATE (editar): Permite modificar los montos o la descripción desde la ventana modal (el lápiz)
   */
  async update(pestana: TipoPestaña, id: number, datosModificados: any, userId: number) {
    if (pestana === TipoPestaña.SERVICIO) {
      const detalle = await this.detalleGastoRepo.findOne({ where: { id_detalle_servicio: id, status: true }, relations: ['gasto'] });
      if (!detalle) throw new NotFoundException('Detalle de viaje no encontrado');
      
      if (datosModificados.monto || datosModificados.descripcion || datosModificados.fecha) {
        Object.assign(detalle.gasto, { ...datosModificados, UpdatedId: userId });
        await this.gastoRepo.save(detalle.gasto);
      }
      
      Object.assign(detalle, { ...datosModificados, UpdatedId: userId });
      await this.detalleGastoRepo.save(detalle);
      
      await this.recalcularCabeceraServicio(detalle.id_gasto_servicio, userId);
      return { success: true, message: 'Detalle de viaje actualizado' };
    }

    const registroExtenso = await this.findOne(pestana, id);
    if (datosModificados.monto || datosModificados.descripcion || datosModificados.fecha) {
      Object.assign(registroExtenso.gasto, { ...datosModificados, UpdatedId: userId });
      await this.gastoRepo.save(registroExtenso.gasto);
    }

    Object.assign(registroExtenso, { ...datosModificados, UpdatedId: userId });
    
    const repo = pestana === TipoPestaña.OPERATIVO ? this.gastoOperativoRepo :
                 pestana === TipoPestaña.ADMINISTRATIVO ? this.gastoAdminRepo : this.gastoGeneralRepo;
    return await this.dataSource.manager.save(registroExtenso);
  }

  /**
   * REMOVE (eliminar): Borrado lógico controlado (el basurero de tu interfaz)
   */
  async remove(pestana: TipoPestaña, id: number, userId: number) {
    if (pestana === TipoPestaña.SERVICIO) {
      const detalle = await this.detalleGastoRepo.findOne({ where: { id_detalle_servicio: id, status: true } });
      if (!detalle) throw new NotFoundException('Detalle no encontrado');
      
      detalle.status = false;
      detalle.UpdatedId = userId;
      await this.detalleGastoRepo.save(detalle);

      await this.recalcularCabeceraServicio(detalle.id_gasto_servicio, userId);
      return { success: true, message: 'Ítem de viaje removido' };
    }

    const registroExtenso = await this.findOne(pestana, id);
    registroExtenso.status = false;
    registroExtenso.UpdatedId = userId;

    if (registroExtenso.gasto) {
      registroExtenso.gasto.status = false;
      registroExtenso.gasto.UpdatedId = userId;
      await this.gastoRepo.save(registroExtenso.gasto);
    }

    const repo = pestana === TipoPestaña.OPERATIVO ? this.gastoOperativoRepo :
                 pestana === TipoPestaña.ADMINISTRATIVO ? this.gastoAdminRepo : this.gastoGeneralRepo;
    return await this.dataSource.manager.save(registroExtenso);
  }

  /**
   * RECALCULAR (Efecto dominó): Automatiza los saldos bimoneda laterales de tu pantalla de Viajes
   */
  private async recalcularCabeceraServicio(idCabecera: number, userId: number) {
    const cabecera = await this.gastosServicioRepo.findOne({ where: { id_gasto_servicio: idCabecera } });
    if (!cabecera) return;

    const detallesActivos = await this.detalleGastoRepo.find({ where: { id_gasto_servicio: idCabecera, status: true }, relations: ['gasto'] });
    
    let nuevoTotalOriginal = 0;
    detallesActivos.forEach(d => nuevoTotalOriginal += Number(d.gasto?.monto || 0));

    cabecera.total_gastos = nuevoTotalOriginal;
    cabecera.total_gastos_bs = nuevoTotalOriginal * Number(cabecera.tipo_cambio);
    cabecera.saldo = Number(cabecera.viatico_entregado) - nuevoTotalOriginal;
    cabecera.saldo_bs = cabecera.saldo * Number(cabecera.tipo_cambio);
    cabecera.UpdatedId = userId;

    await this.gastosServicioRepo.save(cabecera);
  }

  /**
   * SUMATORIAS CONSOLIDADAS: Calcula en Bs. el dinero total para las 4 tarjetas informativas de arriba
   */
  async obtenerTotalesInformativos() {
    const totalServicios = await this.gastosServicioRepo.sum('total_gastos_bs', { status: true }) || 0;
    
    const totalOps = await this.gastoOperativoRepo.createQueryBuilder('go')
      .leftJoin('go.gasto', 'g').select('SUM(g.monto)', 'total')
      .where('go.status = true AND g.status = true').getRawOne();

    const totalAdmin = await this.gastoAdminRepo.createQueryBuilder('ga')
      .leftJoin('ga.gasto', 'g').select('SUM(g.monto)', 'total')
      .where('ga.status = true AND g.status = true').getRawOne();

    const totalGral = await this.gastoGeneralRepo.createQueryBuilder('gg')
      .leftJoin('gg.gasto', 'g').select('SUM(g.monto)', 'total')
      .where('gg.status = true AND g.status = true').getRawOne();

    return {
      totalGastosViaje: Number(totalServicios),
      totalGastosOperativos: Number(totalOps?.total || 0),
      totalGastosAdministrativos: Number(totalAdmin?.total || 0),
      totalGastosGenerales: Number(totalGral?.total || 0)
    };
  }
}