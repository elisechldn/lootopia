import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../orm/prisma/prisma.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('stats')
export class StatsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('all')
  public async getStats() {
    // --- 1. Statistiques des Chasses ---
    const huntsByStatus = await this.prisma.hunt.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const popularHunts = await this.prisma.hunt.findMany({
      select: {
        title: true,
        _count: { select: { participations: true } },
      },
      orderBy: { participations: { _count: 'desc' } },
      take: 5,
    });

    // --- 2. Statistiques des Participations ---
    const participationsByStatus = await this.prisma.participation.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Nouveau : Score moyen des parties complétées
    const averageScoreAgg = await this.prisma.participation.aggregate({
      where: { status: 'COMPLETED' },
      _avg: { totalPoints: true },
    });

    // Nouveau : Activité récente (5 dernières participations mises à jour)
    const recentParticipations = await this.prisma.participation.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        status: true,
        updatedAt: true,
        totalPoints: true,
        user: { select: { username: true } },
        hunt: { select: { title: true } },
      },
    });

    // --- 3. Statistiques des Utilisateurs ---
    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    });

    const usersByCountry = await this.prisma.user.groupBy({
      by: ['country'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // Nouveau : Utilisateurs inscrits dans les 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersCount = await this.prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    // --- 4. Statistiques de Jeu ---
    const stepsByArMode = await this.prisma.step.groupBy({
      by: ['arMode'],
      _count: { id: true },
    });

    const totalCluesUsed = await this.prisma.clueUsage.count();

    // Formatage de la réponse
    return {
      hunts: {
        total: huntsByStatus.reduce((acc, curr) => acc + curr._count.id, 0),
        byStatus: huntsByStatus.map((h) => ({
          status: h.status,
          count: h._count.id,
        })),
        topPopular: popularHunts.map((h) => ({
          title: h.title,
          participations: h._count.participations,
        })),
      },
      participations: {
        total: participationsByStatus.reduce(
          (acc, curr) => acc + curr._count.id,
          0,
        ),
        byStatus: participationsByStatus.map((p) => ({
          status: p.status,
          count: p._count.id,
        })),
        averageScore: averageScoreAgg._avg.totalPoints
          ? Math.round(averageScoreAgg._avg.totalPoints)
          : 0,
      },
      users: {
        total: usersByRole.reduce((acc, curr) => acc + curr._count.id, 0),
        newLast30Days: newUsersCount,
        byRole: usersByRole.map((u) => ({ role: u.role, count: u._count.id })),
        topCountries: usersByCountry.map((u) => ({
          country: u.country,
          count: u._count.id,
        })),
      },
      gameplay: {
        arModesDistribution: stepsByArMode.map((s) => ({
          mode: s.arMode,
          count: s._count.id,
        })),
        totalCluesUsed: totalCluesUsed,
      },
      recentActivity: recentParticipations.map((p) => ({
        username: p.user.username,
        huntTitle: p.hunt.title,
        status: p.status,
        points: p.totalPoints,
        date: p.updatedAt,
      })),
    };
  }
}
