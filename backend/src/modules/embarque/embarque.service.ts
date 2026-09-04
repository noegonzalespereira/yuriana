import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Embarque } from './entities/embarque.entity';
import { CreateEmbarqueDto } from './dto/create-embarque.dto';

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

  async findOne(id: number) {
    const embarque = await this.embarqueRepo.findOne({ where: { id_embarque: id, status: true } });
    if (!embarque) throw new NotFoundException('Embarque no encontrado');
    return embarque;
  }
}