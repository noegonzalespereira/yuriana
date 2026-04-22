import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { Rol } from './entities/rol.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ){}

  async create(createRolDto: CreateRolDto, userId: number): Promise<Rol> {
    const existe_rol = await this.rolRepository.findOneBy({
      nombre: createRolDto.nombre});
    if (existe_rol){
      throw new ConflictException("El nombre del rol ya existe");
    }
    const nuevoRol = this.rolRepository.create({
      ...createRolDto,
      CreatedId: userId,
    });
    return this.rolRepository.save(nuevoRol);
  }
  
  async findAll(): Promise<Rol[]> {
    return this.rolRepository.findBy({status: true});
  }

  async findOne(id: number): Promise<Rol> {
    const rol =  await this.rolRepository.findOne({
      where: {id_rol: id, status: true}
    });
    if(!rol){
      throw new NotFoundException("Rol no encontrado");
    }
    return rol;
  }

  async update(id: number, updateRolDto: UpdateRolDto, userId: number) {
    const rol = await this.findOne(id);
    Object.assign(rol, {
      ...updateRolDto, UpdatedId: userId
    });

    return this.rolRepository.save(rol);
  }

  async remove(id: number, userId: number): Promise<Rol> {
    const rol = await this.findOne(id);
    rol.status = false;
    rol.UpdatedId = userId;
    return this.rolRepository.save(rol);
  }
}
