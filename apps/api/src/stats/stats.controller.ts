import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../orm/prisma/prisma.service';

@Controller('stats')
export class StatsController {
    constructor(private readonly prisma: PrismaService) {}

    @Get('all')
    public async getStats(@Query() query: {  }) { 
        console.log('Received stats request with query:', query);
        


        // 1. Statistiques des Chasses (Hunts)
        const huntsByStatus = await this.prisma.hunt.groupBy({
            by: ['status'],
            _count: { id: true },
        });

        // Top 5 des chasses les plus populaires (avec Prisma _count)
        const popularHunts = await this.prisma.hunt.findMany({
            select: {
                title: true,
                _count: {
                    select: { participations: true }
                }
            },
            orderBy: {
                participations: { _count: 'desc' }
            },
            take: 5,
        });

        // 2. Statistiques des Participations (Taux de complétion)
        const participationsByStatus = await this.prisma.participation.groupBy({
            by: ['status'],
            _count: { id: true },
        });

        // 3. Statistiques des Utilisateurs
        const usersByRole = await this.prisma.user.groupBy({
            by: ['role'],
            _count: { id: true },
        });

        const usersByCountry = await this.prisma.user.groupBy({
            by: ['country'],
            _count: { id: true },
            orderBy: {
                _count: { id: 'desc' }
            }
        });

        // 4. Statistiques de Jeu (Étapes et Réalité Augmentée)
        const stepsByArMode = await this.prisma.step.groupBy({
            by: ['arMode'],
            _count: { id: true },
        });

        const totalCluesUsed = await this.prisma.clueUsage.count();

        // Formatage de la réponse pour le frontend
        return {
            hunts: {
                total: huntsByStatus.reduce((acc, curr) => acc + curr._count.id, 0),
                byStatus: huntsByStatus.map(h => ({ status: h.status, count: h._count.id })),
                topPopular: popularHunts.map(h => ({ title: h.title, participations: h._count.participations }))
            },
            participations: {
                total: participationsByStatus.reduce((acc, curr) => acc + curr._count.id, 0),
                byStatus: participationsByStatus.map(p => ({ status: p.status, count: p._count.id }))
            },
            users: {
                total: usersByRole.reduce((acc, curr) => acc + curr._count.id, 0),
                byRole: usersByRole.map(u => ({ role: u.role, count: u._count.id })),
                topCountries: usersByCountry.map(u => ({ country: u.country, count: u._count.id }))
            },
            gameplay: {
                arModesDistribution: stepsByArMode.map(s => ({ mode: s.arMode, count: s._count.id })),
                totalCluesUsed: totalCluesUsed
            }
        };
    }
}