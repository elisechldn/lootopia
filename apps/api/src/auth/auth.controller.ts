import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    register(@Body() body: {
        firstname: string;
        lastname: string;
        username: string;
        email: string;
        password: string;
        country: string;
    }) {
        return this.authService.register(body);
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() body: { email: string; password: string }) {
        return this.authService.login(body.email, body.password);
    }

    @Post('refresh')
    @HttpCode(200)
    refresh(@Body() body: { userId: number }) {
        return this.authService.refreshToken(body.userId);
    }
}