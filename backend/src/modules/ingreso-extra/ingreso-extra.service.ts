import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateIngresoExtraDto } from './dto/create-ingreso-extra.dto';
import { UpdateIngresoExtraDto } from './dto/update-ingreso-extra.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IngresoExtra } from './entities/ingreso-extra.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { parseDateOnlyBolivia } from '../servicio/date-utils';

@Injectable()
export class IngresoExtraService {
  constructor(
      @InjectRepository(IngresoExtra)
      private readonly ingresoExtraRepository: Repository<IngresoExtra>,
      @InjectRepository(Empresa)
      private readonly empresaRepository: Repository<Empresa>,
      private readonly dataSource: DataSource,
    ) {}


  async create(createIngresoExtraDto: CreateIngresoExtraDto, userId: number): Promise<IngresoExtra> {
    const empresa = await this.empresaRepository.findOne({ where: {} });
    if (!empresa) throw new NotFoundException('No hay empresa registrada en el sistema');

    const fecha = parseDateOnlyBolivia(createIngresoExtraDto.fecha) ?? new Date();
    const nuevoIngresoExtra = this.ingresoExtraRepository.create({
      ...createIngresoExtraDto,
      fecha,
      id_empresa: empresa.id_empresa,
      mes: (fecha.getMonth() + 1).toString().padStart(2, '0'),
      anio: fecha.getFullYear(),
      CreatedId: userId,
    });
    return this.ingresoExtraRepository.save(nuevoIngresoExtra);
  }

  async findAll(filters?: { fecha_inicio?: string; fecha_fin?: string }) {
    const query = this.ingresoExtraRepository.createQueryBuilder('ie')
      .where('ie.status = :status', { status: true });

    if (filters?.fecha_inicio && filters?.fecha_fin) {
      query.andWhere('ie.fecha BETWEEN :f1 AND :f2', {
        f1: filters.fecha_inicio,
        f2: filters.fecha_fin,
      });
    }

    return query.orderBy('ie.fecha', 'DESC').getMany();
  }

  async getTotales(mes?: string, anio?: number) {
    const now = new Date();
    const mesParam = mes || (now.getMonth() + 1).toString().padStart(2, '0');
    const anioParam = anio || now.getFullYear();

    const [extrasResult, fletesResult] = await Promise.all([
      this.ingresoExtraRepository.createQueryBuilder('ie')
        .select('SUM(ie.monto)', 'total')
        .where('ie.status = true AND EXTRACT(MONTH FROM ie.fecha) = :mes AND EXTRACT(YEAR FROM ie.fecha) = :anio', { mes: mesParam, anio: anioParam })
        .getRawOne(),
      this.dataSource.createQueryBuilder()
        .select('SUM(s.total_flete)', 'total')
        .from('servicio', 's')
        .where('s.status = true AND EXTRACT(MONTH FROM s.fecha_inicio) = :mes AND EXTRACT(YEAR FROM s.fecha_inicio) = :anio', { mes: mesParam, anio: anioParam })
        .getRawOne(),
    ]);

    const totalIngresoExtras = Number(extrasResult?.total || 0);
    const totalFletes = Number(fletesResult?.total || 0);
    return {
      totalIngresoExtras,
      totalFletes,
      totalIngresos: +(totalFletes + totalIngresoExtras).toFixed(2),
    };
  }

  async findOne(id: number) {
    const ingresoExtra = await this.ingresoExtraRepository.findOne({
      where: { id_ingreso_extra: id, status: true },
    });
    if (!ingresoExtra) {
      throw new BadRequestException('Ingreso extra no encontrado');
    }
    return ingresoExtra;
  }

  async update(id: number, updateIngresoExtraDto: UpdateIngresoExtraDto, userId: number) {
    const ingresoExtra = await this.findOne(id);

    const extra: any = { ...updateIngresoExtraDto, UpdatedId: userId };
    if (updateIngresoExtraDto.fecha) {
      const fecha = parseDateOnlyBolivia(updateIngresoExtraDto.fecha) ?? new Date();
      extra.fecha = fecha;
      extra.mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      extra.anio = fecha.getFullYear();
    }

    Object.assign(ingresoExtra, extra);
    return this.ingresoExtraRepository.save(ingresoExtra);
  }

  async remove(id: number, userId: number) {
    const ingresoExtra = await this.findOne(id);

    Object.assign(ingresoExtra, { status: false, UpdatedId: userId });
    return this.ingresoExtraRepository.save(ingresoExtra);
  }
}
