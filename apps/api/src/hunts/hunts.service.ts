import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../orm/prisma/prisma.service';
import { CreateHuntDto } from './dto/create-hunt.dto';
import {HuntStatus} from "../orm/prisma/generated/enums";

@Injectable()
export class HuntsService {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(id: number) {
        return this.prisma.hunt.findUnique({
            where: { id },
            include: {
                _count: { select: { participations: true } },
                steps: {
                    orderBy: { orderNumber: 'asc' as const },
                },
            },
        });
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

    async stats(userId: number | null) {
        const where = userId ? { refUser: userId } : {};
        const huntWhere = userId ? { hunt: { refUser: userId } } : {};

        const [total, active, finished] = await Promise.all([
            this.prisma.hunt.count({ where }),
            this.prisma.hunt.count({ where: { ...where, status: 'ACTIVE' as HuntStatus } }),
            this.prisma.hunt.count({ where: { ...where, status: 'FINISHED' as HuntStatus } }),
        ]);
        const players = await this.prisma.participation.count({ where: huntWhere });
        return { total, active, finished, players };
    }

    async create(dto: CreateHuntDto) {
        if (!dto.title) throw new BadRequestException('Le titre est obligatoire');
        if (!dto.refUser) throw new BadRequestException('refUser est obligatoire');

        return this.prisma.hunt.create({
            data: {
                title: dto.title,
                shortDescription: dto.shortDescription ?? null,
                description: dto.description ?? null,
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                location: dto.location ?? null,
                radius: dto.radius ?? 5000,
                difficulty: dto.difficulty ?? 'Intermédiaire',
                status: (dto.status ?? 'DRAFT') as HuntStatus,
                rewardType: dto.rewardType ?? 'DISCOUNT_CODE',
                rewardValue: dto.rewardValue ?? null,
                refUser: Number(dto.refUser),
            },
        });
    }

    async update(id: number, dto: Partial<CreateHuntDto>) {
        return this.prisma.hunt.update({
            where: { id },
            data: {
                ...(dto.title && { title: dto.title }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.startDate !== undefined && {
                    startDate: dto.startDate ? new Date(dto.startDate) : null,
                }),
                ...(dto.endDate !== undefined && {
                    endDate: dto.endDate ? new Date(dto.endDate) : null,
                }),
                ...(dto.location !== undefined && { location: dto.location }),
                ...(dto.status && { status: dto.status as HuntStatus }),
                ...(dto.rewardType && { rewardType: dto.rewardType }),
                ...(dto.rewardValue !== undefined && { rewardValue: dto.rewardValue }),
            },
        });
    }

    async remove(id: number) {
        return this.prisma.hunt.delete({ where: { id } });
    }

    async createSteps(huntId: number, steps: Array<Record<string, unknown>>) {
        await this.prisma.step.deleteMany({ where: { refHunt: huntId } });

        return this.prisma.step.createMany({
            data: steps.map((s, i) => ({
                refHunt: huntId,
                orderNumber: Number(s.orderNumber ?? i + 1),
                title: String(s.title || `Étape ${i + 1}`),
                clue: s.clue ? String(s.clue) : null,
                latitude: s.latitude != null ? Number(s.latitude) : null,
                longitude: s.longitude != null ? Number(s.longitude) : null,
                radius: Number(s.radius ?? 50),
                actionType: String(s.actionType ?? 'QR_CODE') as never,
                arMarker: s.arMarker ? String(s.arMarker) : null,
                arContent: s.arContent ? String(s.arContent) : null,
                qrCode: s.qrCode ? String(s.qrCode) : null,
                points: Number(s.points ?? 0),
            })),
        });
    }

}