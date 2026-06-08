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
