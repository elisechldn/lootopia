import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma, HuntStatus } from '@repo/types';
import { PrismaService } from '../orm/prisma/prisma.service';
import { CreateHuntDto } from './dto/create-hunt.dto';

@Injectable()
export class HuntsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: number) {
    // Une seule requête : agrège le hunt, ses coordonnées projetées,
    // le _count des participations et la liste des steps (avec leurs
    // coordonnées) via json_build_object / json_agg côté Postgres.
    const rows = await this.prisma.$queryRaw<Array<{ hunt: unknown | null }>>(
      Prisma.sql`
        SELECT json_build_object(
          'id', h.id,
          'title', h.title,
          'shortDescription', h."shortDescription",
          'description', h.description,
          'startDate', h."startDate",
          'endDate', h."endDate",
          'radius', h.radius,
          'coverImage', h."coverImage",
          'status', h.status,
          'rewardType', h."rewardType",
          'rewardValue', h."rewardValue",
          'createdAt', h."createdAt",
          'updatedAt', h."updatedAt",
          'refUser', h."refUser",
          'latitude', ST_Y(h."locationCenter"::geometry),
          'longitude', ST_X(h."locationCenter"::geometry),
          '_count', json_build_object(
            'participations', (
              SELECT COUNT(*)::int
              FROM "Participation" p
              WHERE p."refHunt" = h.id
            )
          ),
          'steps', COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', s.id,
                  'orderNumber', s."orderNumber",
                  'title', s.title,
                  'radius', s.radius,
                  'actionType', s."actionType",
                  'arMarkerUrl', s."arMarkerUrl",
                  'arContent', s."arContent",
                  'qrCodeValue', s."qrCodeValue",
                  'points', s.points,
                  'createdAt', s."createdAt",
                  'updatedAt', s."updatedAt",
                  'refHunt', s."refHunt",
                  'latitude', ST_Y(s.location::geometry),
                  'longitude', ST_X(s.location::geometry)
                ) ORDER BY s."orderNumber" ASC
              )
              FROM "Step" s
              WHERE s."refHunt" = h.id
            ),
            '[]'::json
          )
        ) AS hunt
        FROM "Hunt" h
        WHERE h.id = ${id}
      `,
    );

    return rows[0]?.hunt ?? null;
  }

  async findByPartner(userId: number | null) {
    return this.prisma.hunt.findMany({
      where: userId ? { refUser: userId } : undefined,
      include: {
        _count: { select: { participations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findNearby(lat: number, lon: number, searchRadius = 20000): Promise<unknown[]> {
    return this.prisma.$queryRaw(
      Prisma.sql`
                SELECT
                    id, title, "shortDescription",
                    "rewardType", "rewardValue", radius,
                    "startDate", "endDate", "createdAt",
                    ST_Y("locationCenter"::geometry) AS latitude,
                    ST_X("locationCenter"::geometry) AS longitude,
                    ST_Distance(
                        "locationCenter",
                        ST_MakePoint(${lon}, ${lat})::geography
                    ) AS distance
                FROM "Hunt"
                WHERE status = 'ACTIVE'
                  AND "locationCenter" IS NOT NULL
                  AND ST_DWithin(
                      "locationCenter",
                      ST_MakePoint(${lon}, ${lat})::geography,
                      ${searchRadius}
                  )
                ORDER BY distance
            `,
    );
  }

  async stats(userId: number | null) {
    const where = userId ? { refUser: userId } : {};
    const huntWhere = userId ? { hunt: { refUser: userId } } : {};

    const [total, active, finished] = await Promise.all([
      this.prisma.hunt.count({ where }),
      this.prisma.hunt.count({
        where: { ...where, status: 'ACTIVE' as HuntStatus },
      }),
      this.prisma.hunt.count({
        where: { ...where, status: 'FINISHED' as HuntStatus },
      }),
    ]);
    const players = await this.prisma.participation.count({ where: huntWhere });
    return { total, active, finished, players };
  }

  async create(dto: CreateHuntDto) {
    if (!dto.title) throw new BadRequestException('Le titre est obligatoire');
    if (!dto.refUser) throw new BadRequestException('refUser est obligatoire');

    const hunt = await this.prisma.hunt.create({
      data: {
        title: dto.title,
        shortDescription: dto.shortDescription ?? null,
        description: dto.description ?? null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        radius: dto.radius ?? 5000,
        status: (dto.status ?? 'DRAFT') as HuntStatus,
        rewardType: dto.rewardType ?? 'DISCOUNT_CODE',
        rewardValue: dto.rewardValue ?? null,
        refUser: Number(dto.refUser),
      },
    });

    if (dto.locationLat != null && dto.locationLon != null) {
      await this.prisma.$executeRaw(
        Prisma.sql`
                    UPDATE "Hunt"
                    SET "locationCenter" = ST_MakePoint(${dto.locationLon}, ${dto.locationLat})::geography
                    WHERE id = ${hunt.id}
                `,
      );
    }

    return hunt;
  }

  async update(id: number, dto: Partial<CreateHuntDto>) {
    const hunt = await this.prisma.hunt.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.shortDescription !== undefined && {
          shortDescription: dto.shortDescription,
        }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startDate !== undefined && {
          startDate: dto.startDate ? new Date(dto.startDate) : null,
        }),
        ...(dto.endDate !== undefined && {
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        }),
        ...(dto.radius !== undefined && { radius: dto.radius }),
        ...(dto.status && { status: dto.status as HuntStatus }),
        ...(dto.rewardType && { rewardType: dto.rewardType }),
        ...(dto.rewardValue !== undefined && { rewardValue: dto.rewardValue }),
      },
    });

    if (dto.locationLat != null && dto.locationLon != null) {
      await this.prisma.$executeRaw(
        Prisma.sql`
                    UPDATE "Hunt"
                    SET "locationCenter" = ST_MakePoint(${dto.locationLon}, ${dto.locationLat})::geography
                    WHERE id = ${hunt.id}
                `,
      );
    }

    return hunt;
  }

  async remove(id: number) {
    return this.prisma.hunt.delete({ where: { id } });
  }

  async createSteps(huntId: number, steps: Array<Record<string, unknown>>) {
    await this.prisma.step.deleteMany({ where: { refHunt: huntId } });

    const created = await this.prisma.step.createMany({
      data: steps.map((s, i) => ({
        refHunt: huntId,
        orderNumber: Number(s.orderNumber ?? i + 1),
        title: String(s.title || `Étape ${i + 1}`),
        radius: Number(s.radius ?? 50),
        actionType: String(s.actionType ?? 'QR_CODE') as never,
        arMarkerUrl: s.arMarkerUrl ? String(s.arMarkerUrl) : null,
        arContent: s.arContent ? String(s.arContent) : null,
        qrCodeValue: s.qrCodeValue ? String(s.qrCodeValue) : null,
        points: Number(s.points ?? 0),
      })),
    });

    // Inject PostGIS coordinates for steps that provide lat/lon
    for (const s of steps) {
      if (s.latitude != null && s.longitude != null) {
        const step = await this.prisma.step.findFirst({
          where: {
            refHunt: huntId,
            orderNumber: Number(s.orderNumber),
          },
        });
        if (step) {
          await this.prisma.$executeRaw(
            Prisma.sql`
              UPDATE "Step"
              SET "location" = ST_MakePoint(${Number(s.longitude)}, ${Number(s.latitude)})::geography
              WHERE id = ${step.id}
            `,
          );
        }
      }
    }

    return created;
  }
}
