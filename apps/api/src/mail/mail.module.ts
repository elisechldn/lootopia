import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import { MailService } from './mail.service';

// Resolve templates dir: src/ in dev (ts-node or nest start with source),
// dist/src/ in compiled production build.
function resolveTemplatesDir(): string {
  const srcDir = join(process.cwd(), 'src', 'mail', 'templates');
  if (existsSync(srcDir)) return srcDir;
  return join(__dirname, 'templates');
}

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST ?? 'mailpit',
        port: parseInt(process.env.MAIL_PORT ?? '1025'),
        secure: false,
      },
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
