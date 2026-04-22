import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
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
    const tienePermiso = rolesRequeridos.includes(user.rol);
    if (!tienePermiso) {
      throw new ForbiddenException(
        `Acceso denegado. Requiere rol: ${rolesRequeridos.join(' o ')}`
      );
    }
    return true;
  }
}
