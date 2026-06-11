import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StepsService } from './steps.service';
import { PrismaService } from '../orm/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

const mockPrisma = {
  step: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockStorage = {
  uploadObject: jest.fn().mockResolvedValue(undefined),
  deleteObject: jest.fn().mockResolvedValue(undefined),
  toPublicUrl: jest.fn((key: string) => `http://minio/bucket/${key}`),
};

const makeImageFile = (
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File =>
  ({
    fieldname: 'image',
    originalname: 'marker.png',
    mimetype: 'image/png',
    size: 100,
    buffer: Buffer.alloc(100),
    ...overrides,
  }) as Express.Multer.File;

const makePatternFile = (
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File =>
  ({
    fieldname: 'pattern',
    originalname: 'marker.patt',
    mimetype: 'text/plain',
    size: 200,
    buffer: Buffer.from('0 0 0\n0 0 0\n'),
    ...overrides,
  }) as Express.Multer.File;

describe('StepsService', () => {
  let service: StepsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StepsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StorageService, useValue: mockStorage },
      ],
    }).compile();
    service = module.get<StepsService>(StepsService);
  });

  describe('uploadMarkerFiles', () => {
    it('throws 400 when no files provided', async () => {
      await expect(
        service.uploadMarkerFiles(1, 1, 'PARTNER', undefined, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 400 for non-image MIME type', async () => {
      const file = makeImageFile({ mimetype: 'application/pdf' });
      await expect(
        service.uploadMarkerFiles(1, 1, 'PARTNER', file, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 400 for missing image buffer', async () => {
      const file = makeImageFile({ buffer: undefined as unknown as Buffer });
      await expect(
        service.uploadMarkerFiles(1, 1, 'PARTNER', file, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 400 for invalid pattern extension', async () => {
      const patt = makePatternFile({ originalname: 'marker.txt' });
      await expect(
        service.uploadMarkerFiles(1, 1, 'PARTNER', undefined, patt),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 404 when step not found', async () => {
      mockPrisma.step.findUnique.mockResolvedValue(null);
      await expect(
        service.uploadMarkerFiles(
          1,
          1,
          'PARTNER',
          makeImageFile(),
          makePatternFile(),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws 403 when user does not own the step', async () => {
      mockPrisma.step.findUnique.mockResolvedValue({
        id: 1,
        markerImageUrl: null,
        markerPatternUrl: null,
        hunt: { refUser: 999 },
      });
      await expect(
        service.uploadMarkerFiles(
          1,
          1,
          'PARTNER',
          makeImageFile(),
          makePatternFile(),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('returns markerImageUrl and markerPatternUrl when both files provided', async () => {
      mockPrisma.step.findUnique.mockResolvedValue({
        id: 1,
        markerImageUrl: null,
        markerPatternUrl: null,
        hunt: { refUser: 1 },
      });
      mockStorage.uploadObject.mockResolvedValue(undefined);
      mockPrisma.step.update.mockResolvedValue({});

      const result = await service.uploadMarkerFiles(
        1,
        1,
        'PARTNER',
        makeImageFile(),
        makePatternFile(),
      );
      expect(result).toHaveProperty('markerImageUrl');
      expect(result).toHaveProperty('markerPatternUrl');
      expect(mockStorage.uploadObject).toHaveBeenCalledTimes(2);
      expect(mockPrisma.step.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
    });

    it('uploads only image when pattern not provided', async () => {
      mockPrisma.step.findUnique.mockResolvedValue({
        id: 1,
        markerImageUrl: null,
        markerPatternUrl: 'partners/1/ar-markers/1/existing.patt',
        hunt: { refUser: 1 },
      });
      mockStorage.uploadObject.mockResolvedValue(undefined);
      mockPrisma.step.update.mockResolvedValue({});

      const result = await service.uploadMarkerFiles(
        1,
        1,
        'PARTNER',
        makeImageFile(),
        undefined,
      );
      expect(result).toHaveProperty('markerImageUrl');
      expect(result.markerPatternUrl).toBe(
        'partners/1/ar-markers/1/existing.patt',
      );
      expect(mockStorage.uploadObject).toHaveBeenCalledTimes(1);
    });
  });
});
