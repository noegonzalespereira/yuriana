import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';
import { Usuario,EstadoUsuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}
  
  async create(createUsuarioDto: CreateUsuarioDto,userId: number): Promise<Usuario> {
    const existe_usuario = await this.usuarioRepository.findOneBy({
      correo: createUsuarioDto.correo, status: true});
      
    if (existe_usuario) {
      throw new ConflictException("Correo electrónico ya registrado");
    }
    const hashPassword = await bcrypt.hash(createUsuarioDto.password, 10);
    const nuevoUsuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      password: hashPassword,
      CreatedId: userId,
    });
    return this.usuarioRepository.save(nuevoUsuario);

  }

  async findAll(filters: FilterUsuarioDto): Promise<Usuario[]> {
    const query = this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.rol', 'rol')
      .where('usuario.status = :status', { status: true });
    if (filters.nombre){
      query.andWhere('usuario.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
    }
    if( filters.estado){
      query.andWhere('usuario.estado = :estado', { estado: filters.estado });
    }
    if( filters.rol){
      query.andWhere('rol.nombre = :rol', { rol: filters.rol });
    }
    
    return query.getMany();
  }


  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: {id_usuario: id, status: true},
      relations: ['rol']
    });
    if (!usuario) {
      throw new NotFoundException("Usuario no encontrado");
    }
    return usuario;
  }

  async findByCorreo(correo: string): Promise<Usuario | null> {
  return this.usuarioRepository
    .createQueryBuilder('usuario')
    .addSelect('usuario.password') 
    .leftJoinAndSelect('usuario.rol', 'rol')
    .where('usuario.correo = :correo', { correo })
    .andWhere('usuario.status = :status', { status: true })
    .getOne();
  }

  async contador(): Promise<{total:number; activos:number; inactivos: number}> {
    const total = await this.usuarioRepository.count({
      where: { status: true },
    });

    const activos = await this.usuarioRepository.count({
      where: { status:true, estado: EstadoUsuario.ACTIVO }
    });

    const inactivos = await this.usuarioRepository.count({
      where: { status: true, estado: EstadoUsuario.INACTIVO }
    });
    return { total, activos, inactivos };
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto, userId: number) {
    const usuario = await this.findOne(id);
    if(updateUsuarioDto.password){
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }
    Object.assign(usuario, {
      ...updateUsuarioDto, UpdatedId: userId
    });
    return this.usuarioRepository.save(usuario);
  }

  async remove(id: number, userId: number): Promise<Usuario> {
    const usuario = await this.findOne(id);
    usuario.status = false;
    usuario.UpdatedId = userId;
    return this.usuarioRepository.save(usuario);
  }
}
