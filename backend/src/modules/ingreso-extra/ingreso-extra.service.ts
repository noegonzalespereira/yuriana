import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateIngresoExtraDto } from './dto/create-ingreso-extra.dto';
import { UpdateIngresoExtraDto } from './dto/update-ingreso-extra.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IngresoExtra } from './entities/ingreso-extra.entity';
import { Empresa } from '../empresa/entities/empresa.entity';

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

    const fecha = new Date(createIngresoExtraDto.fecha);
    const nuevoIngresoExtra = this.ingresoExtraRepository.create({
      ...createIngresoExtraDto,
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

  async getTotales() {
    const totalExtras = await this.ingresoExtraRepository
      .createQueryBuilder('ie')
      .select('SUM(ie.monto)', 'total')
      .where('ie.status = true')
      .getRawOne();

    const totalFletes = await this.dataSource
      .createQueryBuilder()
      .select('SUM(s.total_flete)', 'total')
      .from('servicio', 's')
      .where('s.status = true')
      .getRawOne();

    return {
      totalIngresoExtras: Number(totalExtras?.total || 0),
      totalFletes: Number(totalFletes?.total || 0),
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
      const fecha = new Date(updateIngresoExtraDto.fecha);
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
