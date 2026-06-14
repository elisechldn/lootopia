import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import { createAcsTransport } from './acs.transport';
import { MailService } from './mail.service';

// Resolve templates dir: src/ in dev (ts-node or nest start with source),
// dist/src/ in compiled production build.
function resolveTemplatesDir(): string {
  const srcDir = join(process.cwd(), 'src', 'mail', 'templates');
  if (existsSync(srcDir)) return srcDir;
  return join(__dirname, 'templates');
}

// En prod : Azure Communication Services Email via SDK (clé, sans auth Entra).
// En local : SMTP en clair vers Mailpit. Le templating Handlebars reste identique.
function resolveTransport() {
  const acsConnectionString = process.env.ACS_CONNECTION_STRING;
  if (acsConnectionString) return createAcsTransport(acsConnectionString);
  return {
    host: process.env.MAIL_HOST ?? 'mailpit',
    port: parseInt(process.env.MAIL_PORT ?? '1025'),
    // STARTTLS si TLS dispo ; Mailpit local reste en clair sur 1025.
    secure: false,
    // Auth uniquement si fournie ; Mailpit local n'en a pas.
    auth: process.env.MAIL_USER
      ? {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        }
      : undefined,
  };
}

@Module({
  imports: [
    MailerModule.forRoot({
      transport: resolveTransport(),
      defaults: {
        from: `"${process.env.MAIL_FROM_NAME ?? 'Lootopia'}" <${process.env.MAIL_FROM ?? 'noreply@lootopia.local'}>`,
      },
      template: {
        dir: resolveTemplatesDir(),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
