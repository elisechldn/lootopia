import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationsService } from './participations.service';
import { PrismaService } from '../orm/prisma/prisma.service';

const mockStep = {
  id: 1,
  orderNumber: 1,
  title: 'Étape test',
  arMode: 'MARKER',
  markerImageUrl: 'http://minio/bucket/image.png',
  markerPatternUrl: 'http://minio/bucket/pattern.patt',
};

const mockGpsStep = {
  id: 2,
  orderNumber: 2,
  title: 'GPS step',
  arMode: 'GPS',
  markerImageUrl: null,
  markerPatternUrl: null,
};

const mockParticipation = {
  id: 1,
  status: 'IN_PROGRESS',
  totalPoints: 0,
  refUser: 42,
  hunt: {
    id: 10,
    title: 'Ma chasse',
    steps: [mockStep, mockGpsStep],
  },
  progresses: [],
};

const mockPrisma = {
  participation: {
    findUnique: jest.fn(),
  },
};

describe('ParticipationsService.findOne', () => {
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

  it('throws NotFoundException when participation not found', async () => {
    mockPrisma.participation.findUnique.mockResolvedValue(null);
    await expect(
      service.findOne(999, { sub: 42, role: 'PLAYER' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('returns participation with hunt.steps including arMode, markerImageUrl, markerPatternUrl', async () => {
    mockPrisma.participation.findUnique.mockResolvedValue(mockParticipation);
    const result = await service.findOne(1, { sub: 42, role: 'PLAYER' });

    const steps = (
      result as { hunt: { steps: typeof mockParticipation.hunt.steps } }
    ).hunt.steps;
    expect(steps).toHaveLength(2);
    expect(steps[0]).toMatchObject({
      arMode: 'MARKER',
      markerImageUrl: 'http://minio/bucket/image.png',
      markerPatternUrl: 'http://minio/bucket/pattern.patt',
    });
  });

  it('GPS steps return arMode: GPS, markerImageUrl: null, markerPatternUrl: null', async () => {
    mockPrisma.participation.findUnique.mockResolvedValue(mockParticipation);
    const result = await service.findOne(1, { sub: 42, role: 'PLAYER' });

    const gpsStep = (result as { hunt: { steps: (typeof mockGpsStep)[] } }).hunt
      .steps[1];
    expect(gpsStep).toMatchObject({
      arMode: 'GPS',
      markerImageUrl: null,
      markerPatternUrl: null,
    });
  });
});

describe('ParticipationsService.validateStep (complétion + bonus temps)', () => {
  const MIN = 60_000;
  const at = (m: number) => new Date(m * MIN);

  // Étape unique (donc dernière) → la validation termine la chasse.
  const lastStepParticipation = {
    id: 1,
    status: 'IN_PROGRESS',
    refUser: 42,
    hunt: { id: 10, steps: [{ id: 1, orderNumber: 1 }] },
    progresses: [{ id: 5, statut: 'IN_PROGRESS', refStep: 1, startedAt: at(0) }],
  };

  const updateSpy = jest.fn().mockResolvedValue({});
  const tx = {
    progress: {
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([
        // 100 points de base + bonus 200 (déjà figé sur le progress) → score final 300
        { totalPoints: 100, timeBonus: 200 },
      ]),
    },
    participation: {
      update: updateSpy,
      findUnique: jest.fn().mockResolvedValue({}),
    },
  };

  const mockPrismaCompletion = {
    participation: { findUnique: jest.fn() },
    step: { findUnique: jest.fn() },
    clueUsage: { count: jest.fn() },
    clue: { findMany: jest.fn() },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(
      (cb: (t: typeof tx) => unknown) => cb(tx) as unknown,
    ),
  };

  let service: ParticipationsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrismaCompletion.participation.findUnique.mockResolvedValue(
      lastStepParticipation,
    );
    mockPrismaCompletion.step.findUnique.mockResolvedValue({
      id: 1,
      orderNumber: 1,
      points: 100,
      radius: 50,
      estimatedDuration: 120,
    });
    mockPrismaCompletion.$queryRaw.mockResolvedValue([{ hasLocation: false }]);
    mockPrismaCompletion.clueUsage.count.mockResolvedValue(0);
    mockPrismaCompletion.clue.findMany.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipationsService,
        { provide: PrismaService, useValue: mockPrismaCompletion },
      ],
    }).compile();
    service = module.get<ParticipationsService>(ParticipationsService);
  });

  it('persiste le score final (base + bonus) à la complétion de la dernière étape', async () => {
    await service.validateStep(1, 1, 42, { latitude: 0, longitude: 0 });

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'COMPLETED',
          totalPoints: 300, // 100 base + 200 bonus
          endTime: expect.any(Date),
        }),
      }),
    );
  });
});
