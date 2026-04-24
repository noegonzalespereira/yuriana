import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import {  Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Persona } from './entities/persona.entity';
import { FilterPersonaDto } from './dto/filter-persona.dto';

@Injectable()
export class PersonaService {
  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
  ) {}
  
  async create(createPersonaDto: CreatePersonaDto, userId: number): Promise<Persona> {
    const existe_persona = await this.personaRepository.findOneBy({
      ci: createPersonaDto.ci});
    
    if(existe_persona){
      throw new ConflictException('Persona con este ci ya registrado')
    }
    const nuevaPersona = this.personaRepository.create({
      ...createPersonaDto,
      CreatedId: userId,
    });
    return this.personaRepository.save(nuevaPersona);
  }

  async findAll(filters: FilterPersonaDto): Promise<Persona[]> {
    const query = this.personaRepository
      .createQueryBuilder('persona')
      .where('persona.status = :status', { status: true});
    if(filters.ci){
      query.andWhere('persona.ci = :ci', { ci: filters.ci });
    }
    if(filters.nombre){
      query.andWhere('persona.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
    }
    return query.getMany();
  }

  async findOne(id: number): Promise<Persona> {
    const persona = await this.personaRepository.findOne({
      where: {id_persona: id}
    });
    if(!persona){
      throw new NotFoundException('Persona no encontrada');
    }
    return persona;
  }

  async update(id: number, updatePersonaDto: UpdatePersonaDto, userId: number) {
    const persona = await this.findOne(id);
    Object.assign(persona, {
      ...updatePersonaDto, UpdatedId: userId
    });
    return this.personaRepository.save(persona);
  }

  async remove(id: number, userId: number): Promise<Persona> {
    const persona = await this.findOne(id);
    persona.status = false;
    persona.UpdatedId = userId;
    return this.personaRepository.save(persona);

  }
}
