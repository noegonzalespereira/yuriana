import { Injectable, UnauthorizedException} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../usuario/usuario.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuarioService: UsuarioService,
  ) {}
  async login(dto: LoginDto) {
    const usuario = await this.usuarioService.findByCorreo(dto.correo);
    if(!usuario){
      throw new UnauthorizedException('Credenciales incorrectas');

    }
    if (usuario.estado !== 'activo'){
      throw new UnauthorizedException('Usuario inactivo');

    }
    const passwordValid = await bcrypt.compare(
      dto.password,
      usuario.password
    );
    if(!passwordValid){
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    //generamos el token
    const payload = {
      sub: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol.nombre,
    };
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol.nombre,

      }
    };
  }
  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
