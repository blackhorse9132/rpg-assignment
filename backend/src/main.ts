import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { mkdirSync } from 'fs';
import { dirname, isAbsolute, resolve } from 'path';

async function bootstrap() {
  const databasePath = process.env.DATABASE_PATH ?? './data/app.sqlite';
  const resolvedDatabasePath = isAbsolute(databasePath)
    ? databasePath
    : resolve(process.cwd(), databasePath);
  mkdirSync(dirname(resolvedDatabasePath), { recursive: true });

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3200);
  console.log(
    `Graphql Endpoint: http://localhost:${process.env.PORT ?? 3200}/graphql`,
  );
}
void bootstrap();
