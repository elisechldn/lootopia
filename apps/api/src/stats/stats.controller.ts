import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../orm/prisma/prisma.service';

@Controller('stats')
export class StatsController {
    constructor(private readonly prisma: PrismaService) {}

    @Get('all')
    public async getStats(@Query() query: { startDate: string, endDate: string }) { 
        const { startDate, endDate } = query;
        console.log('Received stats request with query:', query);
        
        // Sécurité supplémentaire : vérifier que les dates sont bien présentes
        // if (!startDate || !endDate) {
        //     throw new Error("startDate and endDate are required");
        // }

        const statsHunts = await this.prisma.hunt.findMany({
            where: {
                // startDate: {
                //     gte: new Date(startDate),
                //     lte: new Date(endDate),
                // },
                status: 'ACTIVE',
            },
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                refUser: true,
                difficulty: true,
                participations: true,
            },
        });
        console.log(`Found ${statsHunts.length} hunts between ${startDate} and ${endDate}`);
        console.log('Sample hunt:', statsHunts);
        const statsUsers = await this.prisma.user.findMany({
            where: {
                id: {in: statsHunts.map(hunt => hunt.refUser)},
            },
            select: {
                id: true,
                username: true,
                country: true,
            },
        });

        return {
            huntNumbers: statsHunts.length,
            difficultyCounts: 
                Object.entries(
                    statsHunts.reduce((acc, hunt) => {
                        const difficulty = hunt.difficulty!;
                        if (!acc[difficulty]) {
                            acc[difficulty] = 0;
                        }
                        acc[difficulty] += 1;
                        return acc;
                    }, {} as Record<string, number>)
                ).map(([difficulty, count]) => ({ difficulty, count })),

            participationNumbers: statsHunts.reduce((acc, hunt) => acc + hunt.participations.length, 0),
            
            retartitionHunts: Object.entries(statsHunts.reduce((acc, hunt) => {
                const title = hunt.title;
                if (!acc[title]) {
                    acc[title] = 0;
                }
                acc[title] += hunt.participations.length;
                return acc;
            }, {} as Record<string, number>))
            .map(([huntId, count]) => ({ huntId, count })),
            
            userNumbers: statsUsers.length,
            userCountries: Object.entries(
                statsUsers.reduce((acc, user) => {
                    const country = user.country || 'Unknown';
                    if (!acc[country]) {
                        acc[country] = 0;
                    }
                    acc[country] += 1;
                    return acc;
                }, {} as Record<string, number>)
            ).map(([country, count]) => ({ country, count })),
        };
    }
}