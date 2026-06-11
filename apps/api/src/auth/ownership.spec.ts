import { ForbiddenException } from '@nestjs/common';
import { assertOwns, isOwnerOrAdmin } from './ownership';

describe('ownership', () => {
  describe('assertOwns', () => {
    it('laisse passer un ADMIN quel que soit le propriétaire', () => {
      expect(() => assertOwns(999, { sub: 1, role: 'ADMIN' })).not.toThrow();
      expect(() => assertOwns(null, { sub: 1, role: 'ADMIN' })).not.toThrow();
    });

    it('laisse passer le propriétaire', () => {
      expect(() => assertOwns(42, { sub: 42, role: 'PARTNER' })).not.toThrow();
    });

    it('refuse un non-propriétaire non-admin', () => {
      expect(() => assertOwns(42, { sub: 7, role: 'PARTNER' })).toThrow(
        ForbiddenException,
      );
    });

    it('refuse quand la ressource est sans propriétaire (null) pour un non-admin', () => {
      expect(() => assertOwns(null, { sub: 7, role: 'PARTNER' })).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('isOwnerOrAdmin', () => {
    it('true pour un ADMIN', () => {
      expect(isOwnerOrAdmin(999, { sub: 1, role: 'ADMIN' })).toBe(true);
    });

    it('true pour le propriétaire', () => {
      expect(isOwnerOrAdmin(42, { sub: 42, role: 'PLAYER' })).toBe(true);
    });

    it('false pour un tiers non-admin', () => {
      expect(isOwnerOrAdmin(42, { sub: 7, role: 'PARTNER' })).toBe(false);
    });
  });
});
