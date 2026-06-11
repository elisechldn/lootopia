import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendWelcome(user: { email: string; firstname: string }) {
    await this.mailer.sendMail({
      to: user.email,
      subject: 'Bienvenue sur Lootopia !',
      template: 'welcome',
      context: { firstname: user.firstname },
    });
  }

  async sendEmailVerification(
    user: { email: string; firstname: string },
    token: string,
    appUrl: string,
  ) {
    const verificationUrl = `${appUrl}/verify-email?token=${token}`;
    await this.mailer.sendMail({
      to: user.email,
      subject: 'Confirmez votre email Lootopia',
      template: 'email-verification',
      context: { firstname: user.firstname, verificationUrl },
    });
  }

  async sendPasswordReset(
    user: { email: string; firstname: string },
    token: string,
    appUrl: string,
  ) {
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    await this.mailer.sendMail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      template: 'password-reset',
      context: { firstname: user.firstname, resetUrl },
    });
  }
}
