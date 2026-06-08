import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

/**
 * Autorise une route selon le rôle porté par le JWT (`req.user.role`).
 * Doit être placé après `AuthGuard('jwt')`, qui peuple `req.user`.
 * Si la route ne porte pas `@Roles(...)`, le guard ne restreint rien.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      string[] | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string } }>();
    const role = request.user?.role;

    if (!role) {
      throw new ForbiddenException('Authentification requise');
    }
    if (!requiredRoles.includes(role)) {
      throw new ForbiddenException(
        "Vous n'avez pas les droits requis pour cette action",
      );
    }
    return true;
  }
}
