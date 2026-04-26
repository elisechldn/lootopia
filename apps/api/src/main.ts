// Charge .env AVANT tout autre import. Sans ça, les modules NestJS (AuthModule, FilesModule…)
// évalueraient `process.env.JWT_SECRET` au moment de leur déclaration, AVANT que
// ConfigModule n'ait eu le temps de lire le fichier .env. Conséquence : `requireEnv`
// throwerait alors que la variable est bien définie dans .env.
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
