import { ForbiddenException } from '@nestjs/common';

/** Identité issue du JWT vérifié (`req.user`). */
export interface Requester {
  sub: number;
  role: string;
}

/**
 * Vérifie qu'un requester est propriétaire d'une ressource.
 * Les ADMIN ont accès à tout (bypass). Sinon le requester doit être le propriétaire.
 * Lève `ForbiddenException` en cas d'accès non autorisé.
 */
export function assertOwns(
  resourceOwnerId: number | null,
  requester: Requester,
): void {
  if (requester.role === 'ADMIN') {
    return;
  }
  if (resourceOwnerId !== requester.sub) {
    throw new ForbiddenException();
  }
}

/** Variante non-levée : `true` si ADMIN ou propriétaire. */
export function isOwnerOrAdmin(
  resourceOwnerId: number | null,
  requester: Requester,
): boolean {
  return requester.role === 'ADMIN' || resourceOwnerId === requester.sub;
}
