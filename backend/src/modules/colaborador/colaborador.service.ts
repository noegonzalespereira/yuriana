import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Colaborador } from './entities/colaborador.entity';
import { PersonaService } from '../persona/persona.service';
import { FilterColaboradorDto } from './dto/filter-colaborador.dto';

@Injectable()
export class ColaboradorService {
  constructor(
    @InjectRepository(Colaborador)
    private readonly colaboradorRepository: Repository<Colaborador>,
    private readonly personaService: PersonaService,
  ) {}
  async create(createColaboradorDto: CreateColaboradorDto, userId: number): Promise<Colaborador> {
    const {
      nombre, ci, correo, telefono, telefono2, ciudad,
      ...datosColaborador
    } = createColaboradorDto;

    const nuevaPersona = await this.personaService.create({
      nombre, ci, correo, telefono, telefono2, ciudad
    }, userId);

    const nuevoColaborador = this.colaboradorRepository.create({
      ...datosColaborador,
      persona: nuevaPersona,
      CreatedId: userId
    });

    return this.colaboradorRepository.save(nuevoColaborador);

  }

  async findAll(filters: FilterColaboradorDto): Promise<Colaborador[]> {
    const query = this.colaboradorRepository
      .createQueryBuilder('colaborador')
      .leftJoinAndSelect('colaborador.persona', 'persona')
      .where('colaborador.status = :status', { status: true });
    if(filters.tipo_colaborador){
      query.andWhere('colaborador.tipo_colaborador = :tipo_colaborador', { tipo_colaborador: filters.tipo_colaborador });
    }
    
    if(filters.nombre){
      query.andWhere('persona.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
    }
    if(filters.ciudad){
      query.andWhere('persona.ciudad ILIKE :ciudad', { ciudad: `%${filters.ciudad}%` });

    }
    return query.getMany();
  }

  async findOne(ci: number): Promise<Colaborador> {
    const colaborador = await this.colaboradorRepository.findOne({
      where:{ 
        persona: { ci: ci, status: true},
      status: true
    },
      relations: ['persona']
    });

    if(!colaborador){
      throw new NotFoundException('Colaborador no encontrado');
    }
    return colaborador;
  }

  async update(ci: number, updateColaboradorDto: UpdateColaboradorDto, userId: number) {
    const colaborador = await this.findOne(ci);

    const {
      nombre, correo, telefono, telefono2, ciudad,
      ...datosColaborador   
    } = updateColaboradorDto;

    if(nombre || correo || telefono || telefono2 || ciudad){
      await this.personaService.update(colaborador.persona.id_persona,
        { nombre, correo, telefono, telefono2, ciudad }, userId);
    }

    Object.assign(colaborador, {
      ...datosColaborador,
      UpdatedId: userId
    });
    return this.colaboradorRepository.save(colaborador);
  }


  async remove(ci: number, userId: number): Promise<Colaborador> {
    const colaborador = await this.findOne(ci);
    colaborador.status = false;
    colaborador.UpdatedId = userId;
    return this.colaboradorRepository.save(colaborador);
  }
}
