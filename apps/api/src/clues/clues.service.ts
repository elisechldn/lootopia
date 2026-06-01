import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../orm/prisma/prisma.service';
import { CreateClueDto } from './dto/create-clue.dto';
import { UpdateClueDto } from './dto/update-clue.dto';
import type {
  PlayerCluesResponse,
  RevealClueResponse,
} from './dto/player-clues-response.dto';

type ProgressWithOwnership = NonNullable<
  Awaited<ReturnType<CluesService['getProgressWithOwnership']>>
>;

@Injectable()
export class CluesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── CRUD (partenaire / admin) ────────────────────────────────────────────

  async create(
    stepId: number,
    userId: number,
    role: string,
    dto: CreateClueDto,
  ) {
    await this.checkStepOwnership(stepId, userId, role);

    const penaltyCost = dto.penaltyCost ?? 0;

    if (penaltyCost < 0) {
      throw new BadRequestException('Le coût de pénalité ne peut pas être négatif');
    }

    const step = await this.prisma.step.findUnique({
      where: { id: stepId },
      select: { points: true },
    });
    if (!step) throw new NotFoundException('Étape introuvable');

    const existingPenalty = await this.prisma.clue.aggregate({
      where: { refStep: stepId },
      _sum: { penaltyCost: true },
    });
    const usedPenalty = existingPenalty._sum.penaltyCost ?? 0;

    if (usedPenalty + penaltyCost > step.points) {
      throw new BadRequestException(
        `Budget pénalité dépassé. Disponible : ${step.points - usedPenalty} pts sur ${step.points} pts`,
      );
    }

    const maxOrder = await this.prisma.clue.aggregate({
      where: { refStep: stepId },
      _max: { orderNumber: true },
    });
    const orderNumber = (maxOrder._max.orderNumber ?? 0) + 1;

    return this.prisma.clue.create({
      data: {
        message: dto.message,
        penaltyCost,
        orderNumber,
        refStep: stepId,
      },
    });
  }

  async findByStep(stepId: number) {
    return this.prisma.clue.findMany({
      where: { refStep: stepId },
      orderBy: { orderNumber: 'asc' },
    });
  }

  async update(
    clueId: number,
    userId: number,
    role: string,
    dto: UpdateClueDto,
  ) {
    await this.checkClueOwnership(clueId, userId, role);

    if (dto.penaltyCost !== undefined) {
      if (dto.penaltyCost < 0) {
        throw new BadRequestException('Le coût de pénalité ne peut pas être négatif');
      }

      const clue = await this.prisma.clue.findUnique({
        where: { id: clueId },
        select: { refStep: true },
      });
      if (!clue) throw new NotFoundException('Indice introuvable');

      const step = await this.prisma.step.findUnique({
        where: { id: clue.refStep },
        select: { points: true },
      });
      if (!step) throw new NotFoundException('Étape introuvable');

      const otherPenalties = await this.prisma.clue.aggregate({
        where: { refStep: clue.refStep, id: { not: clueId } },
        _sum: { penaltyCost: true },
      });
      const usedPenalty = otherPenalties._sum.penaltyCost ?? 0;

      if (usedPenalty + dto.penaltyCost > step.points) {
        throw new BadRequestException(
          `Budget pénalité dépassé. Disponible : ${step.points - usedPenalty} pts sur ${step.points} pts`,
        );
      }
    }

    return this.prisma.clue.update({
      where: { id: clueId },
      data: {
        ...(dto.message !== undefined && { message: dto.message }),
        ...(dto.penaltyCost !== undefined && { penaltyCost: dto.penaltyCost }),
      },
    });
  }

  async remove(clueId: number, userId: number, role: string) {
    await this.checkClueOwnership(clueId, userId, role);
    const clue = await this.prisma.clue.findUniqueOrThrow({
      where: { id: clueId },
    });
    const stepId = clue.refStep;

    await this.prisma.$transaction(async (tx) => {
      await tx.clue.delete({ where: { id: clueId } });
      await tx.clue.updateMany({
        where: { refStep: stepId, orderNumber: { gt: clue.orderNumber } },
        data: { orderNumber: { decrement: 1 } },
      });
    });
  }

  // ── Reveal (joueur) ──────────────────────────────────────────────────────

  async getPlayerClues(
    progressId: number,
    userId: number,
  ): Promise<PlayerCluesResponse> {
    const progress = await this.getProgressWithOwnership(progressId, userId);

    const allClues = await this.prisma.clue.findMany({
      where: { refStep: progress.refStep },
      orderBy: { orderNumber: 'asc' },
    });

    const revealedIds = new Set(progress.clueUsages.map((cu) => cu.refClue));

    const revealedClues = allClues
      .filter((c) => revealedIds.has(c.id))
      .map((c) => ({
        id: c.id,
        orderNumber: c.orderNumber,
        message: c.message,
        penaltyCost: c.penaltyCost,
      }));

    const next = allClues.find((c) => !revealedIds.has(c.id));

    return {
      totalClues: allClues.length,
      revealedCount: revealedClues.length,
      revealedClues,
      nextClue: next
        ? {
            id: next.id,
            orderNumber: next.orderNumber,
            penaltyCost: next.penaltyCost,
          }
        : null,
    };
  }

  async revealClue(
    progressId: number,
    clueId: number,
    userId: number,
  ): Promise<RevealClueResponse> {
    const progress = await this.getProgressWithOwnership(progressId, userId);

    if (progress.statut !== 'IN_PROGRESS') {
      throw new BadRequestException("Cette étape n'est plus en cours");
    }

    const clue = await this.prisma.clue.findUnique({ where: { id: clueId } });
    if (!clue || clue.refStep !== progress.refStep) {
      throw new NotFoundException('Indice introuvable pour cette étape');
    }

    // Idempotence — déjà révélé ?
    const existing = await this.prisma.clueUsage.findUnique({
      where: {
        refProgress_refClue: { refProgress: progressId, refClue: clueId },
      },
    });

    const totalClues = await this.prisma.clue.count({
      where: { refStep: progress.refStep },
    });
    const isLastClue = clue.orderNumber === totalClues;

    if (existing) {
      return {
        clue: {
          id: clue.id,
          message: clue.message,
          penaltyCost: clue.penaltyCost,
          orderNumber: clue.orderNumber,
        },
        isLastClue,
        alreadyRevealed: true,
      };
    }

    // Vérification séquentielle
    const revealedCount = progress.clueUsages.length;
    if (clue.orderNumber !== revealedCount + 1) {
      throw new BadRequestException(
        `Révélation non séquentielle : attendu orderNumber ${revealedCount + 1}, reçu ${clue.orderNumber}`,
      );
    }

    if (isLastClue) {
      await this.prisma.$transaction(async (tx) => {
        await tx.clueUsage.create({
          data: { refProgress: progressId, refClue: clueId },
        });
        await tx.progress.update({
          where: { id: progressId },
          data: { statut: 'SKIPPED', totalPoints: 0, completedAt: new Date() },
        });
        await this.advanceToNextStep(tx, progress);
      });
    } else {
      await this.prisma.$transaction(async (tx) => {
        await tx.clueUsage.create({
          data: { refProgress: progressId, refClue: clueId },
        });
        const current = await tx.progress.findUnique({
          where: { id: progressId },
          select: { totalPoints: true },
        });
        const newPoints = Math.max(
          0,
          (current?.totalPoints ?? 0) - clue.penaltyCost,
        );
        await tx.progress.update({
          where: { id: progressId },
          data: { totalPoints: newPoints },
        });
      });
    }

    return {
      clue: {
        id: clue.id,
        message: clue.message,
        penaltyCost: clue.penaltyCost,
        orderNumber: clue.orderNumber,
      },
      isLastClue,
      alreadyRevealed: false,
    };
  }

  // ── Helpers privés ───────────────────────────────────────────────────────

  private async getProgressWithOwnership(progressId: number, userId: number) {
    const progress = await this.prisma.progress.findUnique({
      where: { id: progressId },
      include: {
        participation: { select: { refUser: true, id: true, status: true } },
        step: {
          select: {
            id: true,
            orderNumber: true,
            hunt: {
              select: {
                steps: {
                  orderBy: { orderNumber: 'asc' },
                  select: { id: true, orderNumber: true, points: true },
                },
              },
            },
          },
        },
        clueUsages: { select: { refClue: true } },
      },
    });
    if (!progress) throw new NotFoundException('Progress introuvable');
    if (progress.participation.refUser !== userId)
      throw new ForbiddenException();
    return progress;
  }

  private async advanceToNextStep(
    tx: Omit<PrismaService, '$transaction'>,
    progress: ProgressWithOwnership,
  ) {
    const huntSteps = progress.step.hunt.steps;
    const currentOrder = progress.step.orderNumber;
    const nextStep = huntSteps.find((s) => s.orderNumber === currentOrder + 1);

    if (nextStep) {
      await tx.progress.create({
        data: {
          refParticipation: progress.participation.id,
          refStep: nextStep.id,
          statut: 'IN_PROGRESS',
          totalPoints: nextStep.points,
        },
      });
    } else {
      const allProgresses = await tx.progress.findMany({
        where: {
          refParticipation: progress.participation.id,
          statut: { in: ['COMPLETED', 'SKIPPED'] },
        },
        select: { totalPoints: true },
      });
      const totalPoints = allProgresses.reduce(
        (sum, p) => sum + p.totalPoints,
        0,
      );
      await tx.participation.update({
        where: { id: progress.participation.id },
        data: { status: 'COMPLETED', endTime: new Date(), totalPoints },
      });
    }
  }

  private async checkStepOwnership(
    stepId: number,
    userId: number,
    role: string,
  ) {
    if (role === 'ADMIN') return;
    const step = await this.prisma.step.findUnique({
      where: { id: stepId },
      include: { hunt: { select: { refUser: true } } },
    });
    if (!step) throw new NotFoundException('Étape introuvable');
    if (step.hunt.refUser !== userId) throw new ForbiddenException();
  }

  private async checkClueOwnership(
    clueId: number,
    userId: number,
    role: string,
  ) {
    if (role === 'ADMIN') return;
    const clue = await this.prisma.clue.findUnique({
      where: { id: clueId },
      include: { step: { include: { hunt: { select: { refUser: true } } } } },
    });
    if (!clue) throw new NotFoundException('Indice introuvable');
    if (clue.step.hunt.refUser !== userId) throw new ForbiddenException();
  }
}
