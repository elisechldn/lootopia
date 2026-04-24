import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@repo/types';
import { PrismaService } from '../orm/prisma/prisma.service';
import { StartHuntDto } from './dto/start-hunt.dto';
import { ValidateStepDto } from './dto/validate-step.dto';

@Injectable()
export class ParticipationsService {
  constructor(private readonly prisma: PrismaService) {}

  async startHunt(dto: StartHuntDto) {
    const hunt = await this.prisma.hunt.findUnique({
      where: { id: dto.huntId },
      include: { steps: { orderBy: { orderNumber: 'asc' } } },
    });

    if (!hunt) throw new NotFoundException('Chasse introuvable');
    if (hunt.status !== 'ACTIVE') throw new BadRequestException("Cette chasse n'est pas disponible");
    if (hunt.steps.length === 0) throw new BadRequestException("Cette chasse n'a aucune étape");

    const existing = await this.prisma.participation.findUnique({
      where: { refUser_refHunt: { refUser: dto.userId, refHunt: dto.huntId } },
    });

    if (existing) {

      if (existing.status === 'COMPLETED') throw new ConflictException('Vous avez déjà complété cette chasse');

      return this.prisma.participation.findUnique({
        where: { id: existing.id },
        include: {
          hunt: { include: { steps: { orderBy: { orderNumber: 'asc' } } } },
          progresses: { orderBy: { startedAt: 'asc' } },
        },
      });
    }

    const participation = await this.prisma.participation.create({
      data: {
        refUser: dto.userId,
        refHunt: dto.huntId,
        status: 'IN_PROGRESS',
      },
    });

    // Crée un Progress IN_PROGRESS pour la première étape
    const firstStep = hunt.steps[0]!;
    await this.prisma.progress.create({
      data: {
        refParticipation: participation.id,
        refStep: firstStep.id,
        statut: 'IN_PROGRESS',
      },
    });

    return this.prisma.participation.findUnique({
      where: { id: participation.id },
      include: {
        hunt: { include: { steps: { orderBy: { orderNumber: 'asc' } } } },
        progresses: { orderBy: { startedAt: 'asc' } },
      },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.participation.findMany({
      where: { refUser: userId },
      include: {
        hunt: {
          select: {
            id: true,
            title: true,
            rewardType: true,
            rewardValue: true,
          },
        },
        progresses: {
          select: {
            totalPoints: true,
            statut: true,
            completedAt: true,
            refStep: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const participation = await this.prisma.participation.findUnique({
      where: { id },
      include: {
        hunt: { include: { steps: { orderBy: { orderNumber: 'asc' } } } },
        progresses: { include: { clueUsages: true } },
      },
    });
    if (!participation)
      throw new NotFoundException('Participation introuvable');
    return participation;
  }

  async validateStep(
    participationId: number,
    stepId: number,
    dto: ValidateStepDto,
  ) {
    const participation = await this.prisma.participation.findUnique({
      where: { id: participationId },
      include: {
        hunt: { include: { steps: { orderBy: { orderNumber: 'asc' } } } },
        progresses: true,
      },
    });

    if (!participation) throw new NotFoundException('Participation introuvable');
    if (participation.refUser !== dto.userId) throw new ForbiddenException();
    if (participation.status !== 'IN_PROGRESS') throw new BadRequestException("Cette participation n'est plus en cours");


    // L'étape courante est la dernière Progress IN_PROGRESS
    const currentProgress = participation.progresses.find((p) => p.statut === 'IN_PROGRESS' && p.refStep === stepId,);
    if (!currentProgress) throw new BadRequestException("Cette étape n'est pas l'étape courante");

    const step = await this.prisma.step.findUnique({ where: { id: stepId } });
    if (!step) throw new NotFoundException('Étape introuvable');

    // Vérification géofence via PostGIS si l'étape est géolocalisée
    const [geoResult] = await this.prisma.$queryRaw<Array<{ hasLocation: boolean }>>(
      Prisma.sql`SELECT "location" IS NOT NULL AS "hasLocation" FROM "Step" WHERE id = ${stepId}`,
    );
    if (geoResult?.hasLocation) {
      const [result] = await this.prisma.$queryRaw<Array<{ isInZone: boolean }>>(
        Prisma.sql`
          SELECT ST_DWithin(
              "location",
              ST_MakePoint(${dto.longitude}, ${dto.latitude})::geography,
              ${step.radius}
          ) AS "isInZone"
          FROM "Step"
          WHERE id = ${stepId}
        `,
      );
      if (!result?.isInZone) throw new BadRequestException("Vous n'êtes pas dans la zone de déclenchement",);
    }

    // Calcule les points en tenant compte des indices utilisés
    const clueUsagesCount = await this.prisma.clueUsage.count({
      where: { refProgress: currentProgress.id },
    });
    const clues = await this.prisma.clue.findMany({ where: { refStep: stepId } });
    const totalPenalty = clues
      .slice(0, clueUsagesCount)
      .reduce((sum, c) => sum + c.penaltyCost, 0);
    const pointsEarned = Math.max(0, step.points - totalPenalty);

    // Marque le Progress courant comme complété
    await this.prisma.progress.update({
      where: { id: currentProgress.id },
      data: {
        statut: 'COMPLETED',
        totalPoints: pointsEarned,
        completedAt: new Date(),
      },
    });

    // Détermine l'étape suivante
    const currentOrder = step.orderNumber;
    const nextStep = participation.hunt.steps.find(
      (s) => s.orderNumber === currentOrder + 1,
    );

    if (nextStep) {
      await this.prisma.progress.create({
        data: {
          refParticipation: participationId,
          refStep: nextStep.id,
          statut: 'IN_PROGRESS',
        },
      });
      return this.prisma.participation.findUnique({
        where: { id: participationId },
        include: { progresses: true },
      });
    }

    // Dernière étape : chasse terminée
    const allProgresses = await this.prisma.progress.findMany({
      where: { refParticipation: participationId, statut: 'COMPLETED' },
    });
    const totalPoints = allProgresses.reduce((sum, p) => sum + p.totalPoints, 0);

    return this.prisma.participation.update({
      where: { id: participationId },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        totalPoints,
      },
      include: {
        hunt: { select: { title: true, rewardType: true, rewardValue: true } },
      },
    });
  }

  async requestClue(participationId: number, stepId: number, clueId: number, userId: number) {
    const participation = await this.prisma.participation.findUnique({
      where: { id: participationId },
      include: { progresses: true },
    });
    if (!participation)
      throw new NotFoundException('Participation introuvable');
    if (participation.refUser !== userId) throw new ForbiddenException();
    if (participation.status !== 'IN_PROGRESS') {
      throw new BadRequestException("Cette participation n'est plus en cours");
    }

    const currentProgress = participation.progresses.find(
      (p) => p.statut === 'IN_PROGRESS' && p.refStep === stepId,
    );
    if (!currentProgress) {
      throw new BadRequestException("Cette étape n'est pas l'étape courante");
    }

    const clue = await this.prisma.clue.findUnique({ where: { id: clueId } });
    if (!clue || clue.refStep !== stepId)
      throw new NotFoundException('Indice introuvable');

    // Idempotent : ne crée pas un double usage
    const existing = await this.prisma.clueUsage.findUnique({
      where: { refProgress_refClue: { refProgress: currentProgress.id, refClue: clueId } },
    });
    if (existing) return { clue: clue.message, alreadyUsed: true };

    await this.prisma.clueUsage.create({
      data: { refProgress: currentProgress.id, refClue: clueId },
    });

    return { clue: clue.message, alreadyUsed: false, penaltyCost: clue.penaltyCost };
  }

  async leaderboard(huntId: number) {
    return this.prisma.participation.findMany({
      where: { refHunt: huntId, status: 'COMPLETED' },
      select: {
        id: true,
        totalPoints: true,
        startTime: true,
        endTime: true,
        user: { select: { id: true, firstname: true, lastname: true } },
      },
      orderBy: [{ totalPoints: 'desc' }, { endTime: 'asc' }],
    });
  }
}
