import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';

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

          // LÓGICA MEJORADA: La fecha de la cabecera será la fecha más reciente de sus detalles.
          if (dto.items.length === 0) throw new BadRequestException('Debe agregar al menos un detalle de gasto.');
          
          const fechasItems = dto.items.map(item => new Date(`${item.fecha}T00:00:00`));
          const fechaMasReciente = new Date(Math.max.apply(null, fechasItems));

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
            fecha_registro: fechaMasReciente, // <-- CAMBIO CLAVE
            CreatedId: userId
          });
          const cabeceraGuardada = await queryRunner.manager.save(cabeceraGasto);

          // Insertamos todas las filas en el Detalle relacionándolas también a la tabla general Gasto
          for (const item of dto.items) {
            // FIX: Interpretar la fecha como local para evitar el desfase de zona horaria.
            const fGasto = new Date(`${item.fecha}T00:00:00`);
            
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
            // FIX: Interpretar la fecha como local.
            const fGasto = new Date(`${item.fecha}T00:00:00`);

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
            // FIX: Interpretar la fecha como local.
            const fGasto = new Date(`${item.fecha}T00:00:00`);

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
            // FIX: Interpretar la fecha como local.
            const fGasto = new Date(`${item.fecha}T00:00:00`);

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
      
      const cabeceras = await query.orderBy('gs.createdAt', 'DESC').getMany();

      if (cabeceras.length === 0) {
        return [];
      }

      // Enriquecer con los detalles para que el frontend pueda acceder a las fechas individuales
      const cabeceraIds = cabeceras.map(c => c.id_gasto_servicio);
      const todosLosDetalles = await this.detalleGastoRepo.find({
        where: { id_gasto_servicio: In(cabeceraIds), status: true },
        relations: ['gasto'],
      });

      const detallesPorCabecera = todosLosDetalles.reduce((acc, detalle) => {
        (acc[detalle.id_gasto_servicio] = acc[detalle.id_gasto_servicio] || []).push(detalle);
        return acc;
      }, {} as Record<number, DetalleGastoServicio[]>);

      cabeceras.forEach(cabecera => {
        (cabecera as any).detalles = detallesPorCabecera[cabecera.id_gasto_servicio] || [];
      });

      return cabeceras;
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
      registro = await this.gastosServicioRepo.findOne({ 
        where: { id_gasto_servicio: id, status: true }, 
        relations: ['servicio', 'servicio.categoria'] 
      });
      if (registro) {
        (registro as any).detalles = await this.detalleGastoRepo.find({ where: { id_gasto_servicio: id, status: true }, relations: ['gasto'] });
      }
    } else if (pestana === TipoPestaña.OPERATIVO) {
      registro = await this.gastoOperativoRepo.findOne({ where: { id_gasto_operativo: id, status: true }, relations: ['gasto', 'unidad', 'unidad.categoria'] });
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (pestana === TipoPestaña.SERVICIO) {
        // Aquí 'id' es el id_gasto_servicio (la cabecera de la rendición)
        const cabecera = await queryRunner.manager.findOne(GastosServicio, {
          where: { id_gasto_servicio: id, status: true },
        });
        if (!cabecera) throw new NotFoundException('Rendición de gastos no encontrada.');

        // No hay validación de estado de pago, lo cual es correcto según el requisito del cliente.

        const detalles = await queryRunner.manager.find(DetalleGastoServicio, {
          where: { id_gasto_servicio: id, status: true }
        });

        // 1. Borrado lógico de la cabecera
        cabecera.status = false;
        cabecera.UpdatedId = userId;
        await queryRunner.manager.save(cabecera);

        if (detalles.length > 0) {
          const idsGastos = detalles.map(d => d.id_gasto);
          
          // 2. Borrado lógico de los detalles
          await queryRunner.manager.update(DetalleGastoServicio, { id_gasto_servicio: id }, { status: false, UpdatedId: userId });

          // 3. Borrado lógico de los gastos maestros asociados para no dejar registros huérfanos
          if (idsGastos.length > 0) {
            await queryRunner.manager.update(Gasto, { id_gasto: In(idsGastos) }, { status: false, UpdatedId: userId });
          }
        }

        await queryRunner.commitTransaction();
        return { success: true, message: 'Rendición de gastos y sus detalles eliminados correctamente' };

      } else {
        // Lógica transaccional para las otras pestañas (OPERATIVO, ADMINISTRATIVO, GENERAL)
        const { repo, idField } = this.getRepoAndIdField(pestana);
        const registroExtenso = await queryRunner.manager.findOne(repo.target as any, { where: { [idField]: id, status: true }, relations: ['gasto'] });

        if (!registroExtenso) throw new NotFoundException('Gasto no encontrado');

        (registroExtenso as any).status = false;
        (registroExtenso as any).UpdatedId = userId;

        if ((registroExtenso as any).gasto) {
          (registroExtenso as any).gasto.status = false;
          (registroExtenso as any).gasto.UpdatedId = userId;
          await queryRunner.manager.save(Gasto, (registroExtenso as any).gasto);
        }

        await queryRunner.manager.save(registroExtenso);
        await queryRunner.commitTransaction();
        return registroExtenso;
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * RECALCULAR (Efecto dominó): Automatiza los saldos bimoneda laterales de tu pantalla de Viajes
   */
  private async recalcularCabeceraServicio(idCabecera: number, userId: number) {
    const cabecera = await this.gastosServicioRepo.findOne({ where: { id_gasto_servicio: idCabecera } });
    if (!cabecera) return;

    const detallesActivos = await this.detalleGastoRepo.find({ where: { id_gasto_servicio: idCabecera, status: true }, relations: ['gasto'] });
    
    let nuevoTotalOriginal = 0;
    const fechasDetalles = detallesActivos.map(d => {
      nuevoTotalOriginal += Number(d.gasto?.monto || 0);
      return d.gasto.fecha; // Asumimos que la fecha ya es un objeto Date o un string ISO
    });
    const fechaMasReciente = fechasDetalles.length > 0 ? new Date(Math.max.apply(null, fechasDetalles.map(f => new Date(f)))) : new Date();

    cabecera.total_gastos = nuevoTotalOriginal;
    cabecera.total_gastos_bs = nuevoTotalOriginal * Number(cabecera.tipo_cambio);
    cabecera.saldo = Number(cabecera.viatico_entregado) - nuevoTotalOriginal;
    cabecera.saldo_bs = cabecera.saldo * Number(cabecera.tipo_cambio);
    cabecera.fecha_registro = fechaMasReciente; // <-- AÑADIDO: Recalcular fecha representativa
    cabecera.UpdatedId = userId;

    await this.gastosServicioRepo.save(cabecera);
  }

  /**
   * Helper para obtener el repositorio y el campo ID según la pestaña
   */
  private getRepoAndIdField(pestana: TipoPestaña) {
    if (pestana === TipoPestaña.OPERATIVO) return { repo: this.gastoOperativoRepo, idField: 'id_gasto_operativo' };
    if (pestana === TipoPestaña.ADMINISTRATIVO) return { repo: this.gastoAdminRepo, idField: 'id_gasto_admin' };
    if (pestana === TipoPestaña.GENERAL) return { repo: this.gastoGeneralRepo, idField: 'id_gasto_general' };
    throw new BadRequestException('Tipo de pestaña de gasto no válida');
  }

  /**
   * AÑOS CON REGISTROS: Devuelve los años distintos con al menos un gasto, flete o ingreso extra
   */
  async obtenerAniosDisponibles(): Promise<number[]> {
    const result = await this.dataSource.query(`
      SELECT DISTINCT anio FROM gasto WHERE status = true
      UNION
      SELECT DISTINCT anio FROM servicio WHERE status = true
      UNION
      SELECT DISTINCT anio FROM ingreso_extra WHERE status = true
      ORDER BY anio DESC
    `);
    return result.map((r: { anio: string | number }) => Number(r.anio));
  }

  /**
   * SUMATORIAS CONSOLIDADAS: Calcula en Bs. el dinero total para las 4 tarjetas informativas de arriba
   */
  async obtenerTotalesInformativos(filters: { fecha_inicio?: string, fecha_fin?: string }) {
    const now = new Date();
    const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const ultimoDiaMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    const fecha_inicio = filters.fecha_inicio || primerDiaMes;
    const fecha_fin = filters.fecha_fin || ultimoDiaMes;

    const [totalServiciosResult, totalOps, totalAdmin, totalGral] = await Promise.all([
      // Total Gastos de Viaje (se basa en la fecha de registro de la rendición)
      this.gastosServicioRepo.createQueryBuilder('gs')
        .select('SUM(gs.total_gastos_bs)', 'total')
        .where('gs.status = true')
        .andWhere('gs.fecha_registro BETWEEN :f1 AND :f2', { f1: fecha_inicio, f2: fecha_fin })
        .getRawOne(),

      // Total Gastos Operativos (se basa en la fecha del gasto individual)
      this.gastoOperativoRepo.createQueryBuilder('go')
        .leftJoin('go.gasto', 'g').select('SUM(g.monto)', 'total')
        .where('go.status = true AND g.status = true')
        .andWhere('g.fecha BETWEEN :f1 AND :f2', { f1: fecha_inicio, f2: fecha_fin })
        .getRawOne(),

      // Total Gastos Administrativos (se basa en la fecha del gasto individual)
      this.gastoAdminRepo.createQueryBuilder('ga')
        .leftJoin('ga.gasto', 'g').select('SUM(g.monto)', 'total')
        .where('ga.status = true AND g.status = true')
        .andWhere('g.fecha BETWEEN :f1 AND :f2', { f1: fecha_inicio, f2: fecha_fin })
        .getRawOne(),

      // Total Gastos Generales (se basa en la fecha del gasto individual)
      this.gastoGeneralRepo.createQueryBuilder('gg')
        .leftJoin('gg.gasto', 'g').select('SUM(g.monto)', 'total')
        .where('gg.status = true AND g.status = true')
        .andWhere('g.fecha BETWEEN :f1 AND :f2', { f1: fecha_inicio, f2: fecha_fin })
        .getRawOne(),
    ]);

    const totalGastosViaje = Number(totalServiciosResult?.total || 0);
    const totalGastosOperativos = Number(totalOps?.total || 0);
    const totalGastosAdministrativos = Number(totalAdmin?.total || 0);
    const totalGastosGenerales = Number(totalGral?.total || 0);

    return {
      totalGastosViaje,
      totalGastosOperativos,
      totalGastosAdministrativos,
      totalGastosGenerales,
      totalGastos: +(totalGastosViaje + totalGastosOperativos + totalGastosAdministrativos + totalGastosGenerales).toFixed(2),
    };
  }
}