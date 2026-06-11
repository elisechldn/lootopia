import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationsService } from './participations.service';
import { PrismaService } from '../orm/prisma/prisma.service';

const mockPrisma = {
  participation: {
    findMany: jest.fn(),
  },
};

describe('ParticipationsService.findByPlayer (cloisonnement)', () => {
  let service: ParticipationsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ParticipationsService>(ParticipationsService);
  });

  it('ADMIN : récupère toutes les participations du joueur ciblé', async () => {
    mockPrisma.participation.findMany.mockResolvedValue([]);
    await service.findByPlayer(42, { sub: 1, role: 'ADMIN' });
    expect(mockPrisma.participation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { refUser: 42 } }),
    );
  });

  it('PARTNER : limité aux participations sur ses propres chasses', async () => {
    mockPrisma.participation.findMany.mockResolvedValue([]);
    await service.findByPlayer(42, { sub: 7, role: 'PARTNER' });
    expect(mockPrisma.participation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { refUser: 42, hunt: { refUser: 7 } },
      }),
    );
  });
});
