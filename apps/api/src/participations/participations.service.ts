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
import { logInfo } from 'src/loggeur';

@Injectable()
export class ParticipationsService {
  constructor(private readonly prisma: PrismaService) {}

  async startHunt(dto: StartHuntDto) {
    const hunt = await this.prisma.hunt.findUnique({
      where: { id: dto.huntId },
      include: { steps: { orderBy: { orderNumber: 'asc' } } },
    });

    if (!hunt) {
      logInfo(
        'error',
        `la chasse ${dto.huntId} n'a pas été trouvée`,
        'ParticipationsService',
      );
      throw new NotFoundException('Chasse introuvable');
    }
    if (hunt.status !== 'ACTIVE') {
      logInfo(
        'error',
        `la chasse ${dto.huntId} n'est pas disponible`,
        'ParticipationsService',
      );
      throw new BadRequestException("Cette chasse n'est pas disponible");
    }
    if (hunt.steps.length === 0) {
      logInfo(
        'error',
        `la chasse ${dto.huntId} n'a aucune étape`,
        'ParticipationsService',
      );
      throw new BadRequestException("Cette chasse n'a aucune étape");
    }

    const existing = await this.prisma.participation.findUnique({
      where: { refUser_refHunt: { refUser: dto.userId, refHunt: dto.huntId } },
    });

    if (existing) {
      logInfo(
        'info',
        `L'utilisateur ${dto.userId} a déjà une participation pour la chasse ${dto.huntId} avec le statut ${existing.status}`,
        'ParticipationsService',
      );
      if (existing.status === 'COMPLETED') {
        logInfo(
          'error',
          `L'utilisateur ${dto.userId} a déjà complété la chasse ${dto.huntId}`,
          'ParticipationsService',
        );
        throw new ConflictException('Vous avez déjà complété cette chasse');
      }

      logInfo(
        'info',
        `Récupération de la participation existante ${existing.id} pour l'utilisateur ${dto.userId} et la chasse ${dto.huntId}`,
        'ParticipationsService',
      );
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

    logInfo(
      'info',
      `Nouvelle participation ${participation.id} créée pour l'utilisateur ${dto.userId} et la chasse ${dto.huntId}`,
      'ParticipationsService',
    );
    return this.prisma.participation.findUnique({
      where: { id: participation.id },
      include: {
        hunt: { include: { steps: { orderBy: { orderNumber: 'asc' } } } },
        progresses: { orderBy: { startedAt: 'asc' } },
      },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.participation
      .findMany({
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
      })
      .then((participations) => {
        logInfo(
          'info',
          `Récupération de ${participations.length} participations pour l'utilisateur ${userId}`,
          'ParticipationsService',
        );
        return participations;
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
    logInfo(
      'info',
      `Récupération de la participation ${id} pour l'utilisateur ${participation?.refUser}`,
      'ParticipationsService',
    );
    if (!participation) {
      logInfo(
        'error',
        `Participation ${id} introuvable`,
        'ParticipationsService',
      );
      throw new NotFoundException('Participation introuvable');
    }
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

    if (!participation) {
      logInfo(
        'error',
        `Participation ${participationId} introuvable`,
        'ParticipationsService',
      );
      throw new NotFoundException('Participation introuvable');
    }
    if (participation.refUser !== dto.userId) {
      logInfo(
        'error',
        `L'utilisateur ${dto.userId} n'est pas autorisé à valider l'étape ${stepId} pour la participation ${participationId}`,
        'ParticipationsService',
      );
      throw new ForbiddenException();
    }
    if (participation.status !== 'IN_PROGRESS') {
      logInfo(
        'error',
        `La participation ${participationId} n'est plus en cours`,
        'ParticipationsService',
      );
      throw new BadRequestException("Cette participation n'est plus en cours");
    }
    // L'étape courante est la dernière Progress IN_PROGRESS
    const currentProgress = participation.progresses.find(
      (p) => p.statut === 'IN_PROGRESS' && p.refStep === stepId,
    );
    if (!currentProgress) {
      logInfo(
        'error',
        `L'étape ${stepId} n'est pas l'étape courante pour la participation ${participationId}`,
        'ParticipationsService',
      );
      throw new BadRequestException("Cette étape n'est pas l'étape courante");
    }

    const step = await this.prisma.step.findUnique({ where: { id: stepId } });
    if (!step) {
      logInfo(
        'error',
        `L'étape ${stepId} n'est pas trouvée`,
        'ParticipationsService',
      );
      throw new NotFoundException('Étape introuvable');
    }

    // Vérification géofence via PostGIS si l'étape est géolocalisée
    const [geoResult] = await this.prisma.$queryRaw<
      Array<{ hasLocation: boolean }>
    >(
      Prisma.sql`SELECT "location" IS NOT NULL AS "hasLocation" FROM "Step" WHERE id = ${stepId}`,
    );
    if (geoResult?.hasLocation) {
      const [result] = await this.prisma.$queryRaw<
        Array<{ isInZone: boolean }>
      >(
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
      if (!result?.isInZone) {
        logInfo(
          'error',
          `Vous n'êtes pas dans la zone de déclenchement pour l'étape ${stepId}`,
          'ParticipationsService',
        );
        throw new BadRequestException(
          "Vous n'êtes pas dans la zone de déclenchement",
        );
      }
    }

    // Calcule les points en tenant compte des indices utilisés
    const clueUsagesCount = await this.prisma.clueUsage.count({
      where: { refProgress: currentProgress.id },
    });
    const clues = await this.prisma.clue.findMany({
      where: { refStep: stepId },
    });
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
    const totalPoints = allProgresses.reduce(
      (sum, p) => sum + p.totalPoints,
      0,
    );

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
    }).then((updated) => {
        logInfo('info', `Participation ${participationId} complétée avec ${totalPoints} points`, 'ParticipationsService');
        return updated;
    });
  }

  async requestClue(
    participationId: number,
    stepId: number,
    clueId: number,
    userId: number,
  ) {
    const participation = await this.prisma.participation.findUnique({
      where: { id: participationId },
      include: { progresses: true },
    });
    if (!participation)
    {      logInfo(
        'error',
        `Participation ${participationId} introuvable`,
        'ParticipationsService',
      );
      throw new NotFoundException('Participation introuvable');
    }
    if (participation.refUser !== userId){
      logInfo(
        'error',
        `L'utilisateur ${userId} n'est pas le propriétaire de la participation ${participationId}`,
        'ParticipationsService',
      );
      throw new ForbiddenException();
    }
    if (participation.status !== 'IN_PROGRESS') {
      logInfo(
        'error',
        `La participation ${participationId} n'est plus en cours`,
        'ParticipationsService',
      );
      throw new BadRequestException("Cette participation n'est plus en cours");
    }

    const currentProgress = participation.progresses.find(
      (p) => p.statut === 'IN_PROGRESS' && p.refStep === stepId,
    );
    if (!currentProgress) {
      logInfo(
        'error',
        `L'étape ${stepId} n'est pas l'étape courante pour la participation ${participationId}`,
        'ParticipationsService',
      );
      throw new BadRequestException("Cette étape n'est pas l'étape courante");
    }

    const clue = await this.prisma.clue.findUnique({ where: { id: clueId } });
    if (!clue || clue.refStep !== stepId) {
      logInfo(
        'error',
        `L'indice ${clueId} n'est pas disponible pour l'étape ${stepId}`,
        'ParticipationsService',
      );
      throw new NotFoundException('Indice introuvable');
    }

    // Idempotent : ne crée pas un double usage
    const existing = await this.prisma.clueUsage.findUnique({
      where: {
        refProgress_refClue: {
          refProgress: currentProgress.id,
          refClue: clueId,
        },
      },
    });
    if (existing) {
      logInfo(
        'info',
        `L'indice ${clueId} a déjà été utilisé pour l'étape ${stepId}`,
        'ParticipationsService',
      );
      return { clue: clue.message, alreadyUsed: true };
    }

    await this.prisma.clueUsage.create({
      data: { refProgress: currentProgress.id, refClue: clueId },
    });
        logInfo('info', `L'indice ${clueId} a été utilisé pour l'étape ${stepId}`, 'ParticipationsService');
    return {
      clue: clue.message,
      alreadyUsed: false,
      penaltyCost: clue.penaltyCost,
    };
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
    }).then((results) => {
        logInfo('info', `Récupération du leaderboard pour la chasse ${huntId} avec ${results.length} participations`, 'ParticipationsService');
        return results;
    });
  }
}
