import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../orm/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
    ) {}

    async register(dto: {
        firstname: string;
        lastname: string;
        username: string;
        email: string;
        password: string;
        country: string;
    }) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) throw new ConflictException('Email déjà utilisé');

        const hash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                ...dto,
                password: hash,
                role: 'PARTNER', // inscription depuis le back-office = partenaire
            },
        });

        return this.signToken(user);
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('Identifiants invalides');

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new UnauthorizedException('Identifiants invalides');

        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastConnection: new Date() },
        });

        return this.signToken(user);
    }

    private signToken(user: { id: number; email: string; role: string; firstname: string; lastname: string }) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        return {
            access_token: this.jwt.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                role: user.role,
            },
        };
    }

    async refreshToken(userId: number) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

        return this.signToken(user);
    }
}