import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (!rolesRequeridos) return true;
    const { user } = context.switchToHttp().getRequest();
    // Si RolesGuard se usa alguna vez sin JwtAuthGuard antes, esto evita un
    // error 500 confuso y devuelve un 401 claro en su lugar.
    if (!user) {
      throw new UnauthorizedException('Debe iniciar sesión para acceder a este recurso');
    }
    const tienePermiso = rolesRequeridos.includes(user.rol);
    if (!tienePermiso) {
      throw new ForbiddenException(
        `Acceso denegado. Requiere rol: ${rolesRequeridos.join(' o ')}`
      );
    }
    return true;
  }
}
