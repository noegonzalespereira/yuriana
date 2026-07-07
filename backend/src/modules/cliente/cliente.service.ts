import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
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
    if (createClienteDto.nit) {
      const existeNit = await this.clienteRepository.findOneBy({ nit: createClienteDto.nit, status: true });
      if (existeNit) throw new ConflictException('El NIT ingresado ya está registrado en el sistema');
    }

    const {
      nombre, ci, correo, telefono, telefono2, ciudad,
      ...datosCliente
     } = createClienteDto;

    const nuevaPersona = await this.personaService.create({
      nombre,
      telefono,
      ...(ci       && { ci }),
      ...(correo   && { correo }),
      ...(telefono2 && { telefono2 }),
      ...(ciudad   && { ciudad }),
    } as any, userId);

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

    if (filters.buscar) {
      const b = `%${filters.buscar.trim().toUpperCase()}%`;
      query.andWhere(new Brackets(qb => {
        qb.where('cliente.codigo_cliente ILIKE :b', { b })
          .orWhere('persona.nombre ILIKE :b', { b });
      }));
    }

    if (filters.codigo_cliente) {
      query.andWhere('cliente.codigo_cliente ILIKE :codigo', {
        codigo: `%${filters.codigo_cliente.trim().toUpperCase()}%`,
      });
    }
    if (filters.nombre) {
      query.andWhere('persona.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
    }

    query.orderBy('cliente.id_cliente', 'DESC');
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

    if (updateClienteDto.nit !== undefined && updateClienteDto.nit !== cliente.nit) {
      const existeNit = await this.clienteRepository.findOneBy({ nit: updateClienteDto.nit, status: true });
      if (existeNit && existeNit.id_cliente !== cliente.id_cliente) {
        throw new ConflictException('El NIT ingresado ya está registrado en el sistema');
      }
    }

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
