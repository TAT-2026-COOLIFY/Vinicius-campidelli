import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function inicializarAplicacao() {
  const aplicacao = await NestFactory.create(AppModule);

  aplicacao.setGlobalPrefix('api');
  const origensPermitidas = (process.env.FRONTEND_URL ?? 'http://localhost:4200').split(',');
  aplicacao.enableCors({ origin: origensPermitidas });
  aplicacao.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const porta = process.env.PORT ?? 3000;
  await aplicacao.listen(porta);
  console.log(`API do Autocenter disponivel em http://localhost:${porta}/api`);
}

inicializarAplicacao();
