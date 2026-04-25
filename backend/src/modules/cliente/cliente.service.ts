import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { PersonaService } from '../persona/persona.service';
import { FilterClienteDto } from './dto/filter-cliente.dto';
@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    private readonly personaService: PersonaService,
  ) {}

  async create(createClienteDto: CreateClienteDto, userId: number): Promise<Cliente> {
    const { 
      nombre, ci, correo, telefono, telefono2, ciudad,
      ...datosCliente
     } = createClienteDto;

    const nuevaPersona = await this.personaService.create({
      nombre, ci, correo, telefono, telefono2, ciudad
    }, userId);

    const nuevoCliente = this.clienteRepository.create({
      ...datosCliente,
      persona: nuevaPersona,
      CreatedId: userId
    });

    const clienteGuardado = await this.clienteRepository.save(nuevoCliente);

    clienteGuardado.codigo_cliente = `C-${clienteGuardado.id_cliente}`;
    return await this.clienteRepository.save(clienteGuardado);
  }

  async findAll(filters: FilterClienteDto): Promise<Cliente[]> {
    const query = this.clienteRepository
      .createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.persona', 'persona')
      .where('cliente.status = :status', { status: true });
    if (filters.codigo_cliente){
      query.andWhere('cliente.codigo_cliente ILIKE :codigo_cliente', { codigo_cliente: `%${filters.codigo_cliente.toUpperCase()}%` });
    }
    if (filters.ci){
      query.andWhere('persona.ci = :ci', { ci: filters.ci });
    }
    if (filters.nombre){
      query.andWhere('persona.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
    }
    return query.getMany();
  
    
  }

  async findOne(codigo_cliente: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where:{ codigo_cliente: codigo_cliente.toUpperCase(),status:true},
      relations: ['persona']
    });
    if(!cliente){
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  async update(codigo_cliente: string, updateClienteDto: UpdateClienteDto, userId: number) {
    const cliente = await this.findOne(codigo_cliente);

    const { 
      nombre, ci, correo, telefono, telefono2, ciudad,
      ...datosCliente
     } = updateClienteDto;
    
    if(nombre || ci || correo || telefono || telefono2 || ciudad){
      await this.personaService.update(cliente.persona.id_persona,
        { nombre, ci, correo, telefono, telefono2, ciudad }, userId);
    }

    Object.assign(cliente, {
      ...datosCliente,
      UpdatedId: userId
    });
    return this.clienteRepository.save(cliente);
  }

  async remove(codigo_cliente: string, userId: number): Promise<Cliente> {
    const cliente = await this.findOne(codigo_cliente);
    cliente.status = false;
    cliente.UpdatedId = userId;
    return this.clienteRepository.save(cliente);
  }
}
