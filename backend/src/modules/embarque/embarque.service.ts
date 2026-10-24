import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Embarque } from './entities/embarque.entity';
import { CreateEmbarqueDto } from './dto/create-embarque.dto';
import { UpdateEmbarqueDto } from './dto/update-embarque.dto';
import { Servicio } from '../servicio/entities/servicio.entity';

@Injectable()
export class EmbarqueService {
  constructor(@InjectRepository(Embarque) private readonly embarqueRepo: Repository<Embarque>) {}

  async findDisponibles(buscar?: string) {
    const query = this.embarqueRepo.createQueryBuilder('embarque')
      .where('embarque.status = true')
      .andWhere('embarque.visible = true')
      .andWhere('embarque.unidades_restantes > 0');

    if (buscar?.trim()) query.andWhere('embarque.crt ILIKE :buscar', { buscar: `%${buscar.trim()}%` });
    return query.orderBy('embarque.createdAt', 'DESC').getMany();
  }

  async create(dto: CreateEmbarqueDto, userId: number) {
    const existente = await this.embarqueRepo.findOne({ where: { crt: dto.crt, status: true } });
    if (existente) throw new ConflictException('Ya existe un embarque con ese CRT');

    return this.embarqueRepo.save(this.embarqueRepo.create({
      crt: dto.crt,
      total_unidades: dto.total_unidades,
      unidades_restantes: dto.total_unidades,
      visible: true,
      CreatedId: userId,
    }));
  }

  async findAll(buscar?: string) {
    const query = this.embarqueRepo.createQueryBuilder('embarque')
      .loadRelationCountAndMap('embarque.servicios_count', 'embarque.servicios', 'srv', (qb) =>
        qb.where('srv.status = true'))
      .where('embarque.status = true');

    if (buscar?.trim()) query.andWhere('embarque.crt ILIKE :buscar', { buscar: `%${buscar.trim()}%` });
    return query.orderBy('embarque.createdAt', 'DESC').getMany();
  }

  async update(id: number, dto: UpdateEmbarqueDto, userId: number) {
    const embarque = await this.findOne(id);

    if (dto.crt && dto.crt !== embarque.crt) {
      const duplicado = await this.embarqueRepo.findOne({ where: { crt: dto.crt } });
      if (duplicado && duplicado.id_embarque !== id) throw new ConflictException('Ya existe un embarque con ese CRT');
      embarque.crt = dto.crt;
    }

    if (dto.total_unidades !== undefined) {
      const usadas = embarque.total_unidades - embarque.unidades_restantes;
      if (dto.total_unidades < usadas) {
        throw new BadRequestException(`El embarque ya tiene ${usadas} viaje(s) asignado(s); el total no puede ser menor`);
      }
      embarque.total_unidades = dto.total_unidades;
      embarque.unidades_restantes = dto.total_unidades - usadas;
      embarque.visible = embarque.unidades_restantes > 0;
    }

    embarque.UpdatedId = userId;
    return this.embarqueRepo.save(embarque);
  }

  async remove(id: number) {
    const embarque = await this.findOne(id);
    const asignados = await this.embarqueRepo.manager.count(Servicio, { where: { id_embarque: id } });
    if (asignados > 0) {
      throw new ConflictException(`No se puede eliminar: el CRT tiene ${asignados} viaje(s) asignado(s). Reasígnelos primero`);
    }
    await this.embarqueRepo.remove(embarque);
    return { message: 'Embarque eliminado' };
  }

  async findOne(id: number) {
    const embarque = await this.embarqueRepo.findOne({ where: { id_embarque: id, status: true } });
    if (!embarque) throw new NotFoundException('Embarque no encontrado');
    return embarque;
  }
}