import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, HuntStatus } from '@repo/types';
import { PrismaService } from '../orm/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateHuntDto } from './dto/create-hunt.dto';
import { logInfo } from '../loggeur';
@Injectable()
export class HuntsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findOne(id: number) {
    // Une seule requête : agrège le hunt, ses coordonnées projetées,
    // le _count des participations et la liste des steps (avec leurs
    // coordonnées) via json_build_object / json_agg côté Postgres.
    const rows = await this.prisma.$queryRaw<Array<{ hunt: unknown | null }>>(
      Prisma.sql`
        SELECT json_build_object(
          'id', h.id,
          'title', h.title,
          'shortDescription', h."short_description",
          'description', h.description,
          'startDate', h."start_date",
          'endDate', h."end_date",
          'radius', h.radius,
          'coverImage', h."cover_image",
          'status', h.status,
          'rewardType', h."reward_type",
          'rewardValue', h."reward_value",
          'createdAt', h."created_at",
          'updatedAt', h."updated_at",
          'refUser', h."ref_user",
          'latitude', ST_Y(h."location_center"::geometry),
          'longitude', ST_X(h."location_center"::geometry),
          '_count', json_build_object(
            'participations', (
              SELECT COUNT(*)::int
              FROM "participations" p
              WHERE p."ref_hunt" = h.id
            )
          ),
          'steps', COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', s.id,
                  'orderNumber', s."order_number",
                  'title', s.title,
                  'radius', s.radius,
                  'points', s.points,
                  'createdAt', s."created_at",
                  'updatedAt', s."updated_at",
                  'refHunt', s."ref_hunt",
                  'arMode', s."ar_mode",
                  'markerImageUrl', s."marker_image_url",
                  'markerPatternUrl', s."marker_pattern_url",
                  'refArItem', s."ref_ar_item",
                  'latitude', ST_Y(s.location::geometry),
                  'longitude', ST_X(s.location::geometry),
                  'clues', COALESCE((
                    SELECT json_agg(
                       json_build_object(
                           'id', c.id,
                           'message', c.message,
                           'penaltyCost', c."penalty_cost",
                           'orderNumber', c."order_number"
                       ) ORDER BY c."order_number" ASC
                    )
                    FROM "clues" c
                    WHERE c."ref_step" = s.id
                  ), '[]'::json),
                  'arItem', CASE
                    WHEN ai.id IS NOT NULL THEN json_build_object(
                      'id', ai.id,
                      'filename', ai.filename,
                      'filepath', ai.filepath,
                      'hasAnimations', ai."has_animations"
                    )
                    ELSE NULL
                  END
                ) ORDER BY s."order_number" ASC
              )
              FROM "steps" s
              LEFT JOIN "ar_items" ai ON ai.id = s."ref_ar_item"
              WHERE s."ref_hunt" = h.id
            ),
            '[]'::json
          )
        ) AS hunt
        FROM "hunts" h
        WHERE h.id = ${id}
      `,
    );
    logInfo('info', `Récupération de la chasse ${id}`, 'HuntsService');
    return rows[0]?.hunt ?? null;
  }

  async findByPartner(userId: number | null) {
    return this.prisma.hunt
      .findMany({
        where: userId ? { refUser: userId } : undefined,
        include: {
          _count: { select: { participations: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      .then((hunts) => {
        logInfo(
          'info',
          `Récupération des chasses pour le partenaire ${userId ?? 'tous les utilisateurs (soit pas relou)'} avec ${hunts.length} chasses`,
          'HuntsService',
        );
        return hunts;
      });
  }

  async findNearby(
    lat: number,
    lon: number,
    searchRadius = 20000,
  ): Promise<unknown[]> {
    return this.prisma.$queryRaw(
      Prisma.sql`
                SELECT
                    id, title,
                    "short_description"   AS "shortDescription",
                    "reward_type"         AS "rewardType",
                    "reward_value"        AS "rewardValue",
                    radius,
                    "start_date"          AS "startDate",
                    "end_date"            AS "endDate",
                    "created_at"          AS "createdAt",
                    ST_Y("location_center"::geometry) AS latitude,
                    ST_X("location_center"::geometry) AS longitude,
                    ST_Distance(
                        "location_center",
                        ST_MakePoint(${lon}, ${lat})::geography
                    ) AS distance
                FROM "hunts"
                WHERE status = 'ACTIVE'
                  AND "location_center" IS NOT NULL
                  AND ST_DWithin(
                      "location_center",
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
    logInfo(
      'info',
      `Récupération des statistiques pour le partenaire ${userId ?? 'tous les utilisateurs (soit pas relou)'} : ${total} chasses au total, ${active} actives, ${finished} terminées, ${players} participations`,
      'HuntsService',
    );
    return { total, active, finished, players };
  }

  async analytics(userId: number | null) {
    const hunts = await this.prisma.hunt.findMany({
      where: userId ? { refUser: userId } : undefined,
      include: {
        _count: { select: { participations: true } },
        participations: {
          select: {
            status: true,
            totalPoints: true,
            startTime: true,
            endTime: true,
            progresses: {
              select: {
                totalPoints: true,
                statut: true,
                clueUsages: { select: { id: true } },
              },
            },
          },
        },
        steps: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return hunts.map((hunt) => {
      const completed = hunt.participations.filter(
        (p) => p.status === 'COMPLETED',
      );
      const inProgress = hunt.participations.filter(
        (p) => p.status === 'IN_PROGRESS',
      );

      const avgDuration =
        completed.length > 0
          ? completed.reduce((sum, p) => {
              if (!p.endTime) return sum;
              const diff = p.endTime.getTime() - p.startTime.getTime();
              if (diff <= 0) return sum; // ← ignorer les durées incohérentes
              return sum + diff;
            }, 0) /
            completed.length /
            1000 /
            60
          : null;

      const totalClueUsages = hunt.participations.reduce(
        (sum, p) =>
          sum + p.progresses.reduce((s, pr) => s + pr.clueUsages.length, 0),
        0,
      );

      return {
        id: hunt.id,
        title: hunt.title,
        status: hunt.status,
        totalParticipants: hunt._count.participations,
        completedCount: completed.length,
        inProgressCount: inProgress.length,
        avgDurationMinutes: avgDuration ? Math.round(avgDuration) : null,
        totalClueUsages,
        stepsCount: hunt.steps.length,
      };
    });
  }

  async create(dto: CreateHuntDto) {
    if (!dto.title) {
      logInfo(
        'error',
        'encore un crétin qui ne met pas de titre',
        'HuntsService',
      );
      throw new BadRequestException('Le titre est obligatoire');
    }
    if (!dto.refUser) {
      logInfo('error', 'mais il fait quoi lui sans refUser', 'HuntsService');
      throw new BadRequestException('refUser est obligatoire');
    }

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
        coverImage: dto.coverImage ?? null,
        refUser: Number(dto.refUser),
      },
    });

    if (dto.locationLat != null && dto.locationLon != null) {
      await this.prisma.$executeRaw(
        Prisma.sql`
                    UPDATE "hunts"
                    SET "location_center" = ST_MakePoint(${dto.locationLon}, ${dto.locationLat})::geography
                    WHERE id = ${hunt.id}
                `,
      );
    }

    logInfo(
      'info',
      `Chasse ${hunt.id} créée par le partenaire ${dto.refUser}`,
      'HuntsService',
    );
    return hunt;
  }

  async update(id: number, dto: Partial<CreateHuntDto>) {
    if (dto.coverImage !== undefined) {
      const existing = await this.prisma.hunt.findUnique({
        where: { id },
        select: { coverImage: true },
      });
      if (existing?.coverImage && existing.coverImage !== dto.coverImage) {
        await this.storage.deleteObject(existing.coverImage).catch(() => {});
      }
    }

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
        ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
      },
    });

    if (dto.locationLat != null && dto.locationLon != null) {
      await this.prisma.$executeRaw(
        Prisma.sql`
                    UPDATE "hunts"
                    SET "location_center" = ST_MakePoint(${dto.locationLon}, ${dto.locationLat})::geography
                    WHERE id = ${hunt.id}
                `,
      );
    }

    logInfo(
      'info',
      `Chasse ${hunt.id} mise à jour par le partenaire ${dto.refUser}`,
      'HuntsService',
    );
    return hunt;
  }

  async remove(id: number) {
    const hunt = await this.prisma.hunt.findUnique({ where: { id } });
    if (!hunt) {
      logInfo('error', `Chasse ${id} non trouvée`, 'HuntsService');
      throw new NotFoundException('Chasse non trouvée');
    }
    logInfo(
      'info',
      `Chasse ${hunt.id} supprimée par le partenaire ${hunt.refUser}`,
      'HuntsService',
    );
    return this.prisma.hunt.delete({ where: { id } });
  }

  async upsertSteps(huntId: number, steps: Array<Record<string, unknown>>) {
    const incomingIds = steps
      .filter((s) => s.id != null)
      .map((s) => Number(s.id));

    const stepsToDelete = await this.prisma.step.findMany({
      where: {
        refHunt: huntId,
        ...(incomingIds.length > 0 ? { id: { notIn: incomingIds } } : {}),
      },
      select: { markerImageUrl: true, markerPatternUrl: true },
    });

    await Promise.all(
      stepsToDelete
        .flatMap((s) => [
          s.markerImageUrl
            ? this.storage.deleteObject(s.markerImageUrl).catch(() => {})
            : null,
          s.markerPatternUrl
            ? this.storage.deleteObject(s.markerPatternUrl).catch(() => {})
            : null,
        ])
        .filter((p): p is Promise<void> => p !== null),
    );

    await this.prisma.step.deleteMany({
      where: {
        refHunt: huntId,
        ...(incomingIds.length > 0 ? { id: { notIn: incomingIds } } : {}),
      },
    });

    const savedSteps: Array<{ id: number; orderNumber: number }> = [];

    for (const [i, s] of steps.entries()) {
      const stepData = {
        refHunt: huntId,
        orderNumber: Number(s.orderNumber ?? i + 1),
        title: String(s.title || `Étape ${i + 1}`),
        radius: Number(s.radius ?? 50),
        arMode: (s.arMode === 'MARKER' ? 'MARKER' : 'GPS') as never,
        refArItem: s.refArItem ? String(s.refArItem) : null,
        points: Number(s.points ?? 0),
        markerImageUrl: s.markerImageUrl ? String(s.markerImageUrl) : null,
        markerPatternUrl: s.markerPatternUrl
          ? String(s.markerPatternUrl)
          : null,
      };

      let step;
      if (s.id) {
        const existing = await this.prisma.step.findUnique({
          where: { id: Number(s.id) },
          select: { markerImageUrl: true, markerPatternUrl: true },
        });
        if (existing?.markerImageUrl && !s.markerImageUrl) {
          await this.storage
            .deleteObject(existing.markerImageUrl)
            .catch(() => {});
        }
        if (existing?.markerPatternUrl && !s.markerPatternUrl) {
          await this.storage
            .deleteObject(existing.markerPatternUrl)
            .catch(() => {});
        }
        step = await this.prisma.step.update({
          where: { id: Number(s.id) },
          data: stepData,
        });
      } else {
        step = await this.prisma.step.create({ data: stepData });
      }
      savedSteps.push({ id: step.id, orderNumber: step.orderNumber });

      if (s.latitude != null && s.longitude != null) {
        await this.prisma.$executeRaw(
          Prisma.sql`
            UPDATE "steps"
            SET "location" = ST_MakePoint(${Number(s.longitude)}, ${Number(s.latitude)})::geography
            WHERE id = ${step.id}
          `,
        );
      }

      const clues = s.clues as
        | Array<{
            id?: number;
            message: string;
            penaltyCost?: number;
            orderNumber?: number;
          }>
        | undefined;
      if (Array.isArray(clues)) {
        const incomingClueIds = clues
          .filter((c) => c.id != null)
          .map((c) => Number(c.id));

        await this.prisma.clue.deleteMany({
          where: {
            refStep: step.id,
            ...(incomingClueIds.length > 0
              ? { id: { notIn: incomingClueIds } }
              : {}),
          },
        });

        for (const [j, c] of clues.entries()) {
          if (c.id) {
            await this.prisma.clue.update({
              where: { id: Number(c.id) },
              data: {
                message: String(c.message),
                penaltyCost: Number(c.penaltyCost ?? 0),
                orderNumber: Number(c.orderNumber ?? j + 1),
              },
            });
          } else {
            await this.prisma.clue.create({
              data: {
                message: String(c.message),
                penaltyCost: Number(c.penaltyCost ?? 0),
                orderNumber: Number(c.orderNumber ?? j + 1),
                refStep: step.id,
              },
            });
          }
        }
      }
    }

    logInfo(
      'info',
      `Création de ${savedSteps.length} étapes pour la chasse ${huntId}`,
      'HuntsService',
    );

    return savedSteps;
  }
}
