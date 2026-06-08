// Charge .env AVANT tout autre import. Sans ça, les modules NestJS (AuthModule, FilesModule…)
// évalueraient `process.env.JWT_SECRET` au moment de leur déclaration, AVANT que
// ConfigModule n'ait eu le temps de lire le fichier .env. Conséquence : `requireEnv`
// throwerait alors que la variable est bien définie dans .env.
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { logInfo } from './loggeur';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  logInfo('info', 'API server started');
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  logInfo('info', 'CORS enabled for all origins');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
