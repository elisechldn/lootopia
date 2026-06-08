import { SetMetadata } from '@nestjs/common';
import type { Role } from '@repo/types';

export const ROLES_KEY = 'roles';

/**
 * Restreint une route aux rôles indiqués.
 * À utiliser avec `RolesGuard` : `@UseGuards(AuthGuard('jwt'), RolesGuard)`.
 * Sans ce décorateur, `RolesGuard` laisse passer tout utilisateur authentifié.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
