import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function inicializarAplicacao() {
  const aplicacao = await NestFactory.create(AppModule);

  aplicacao.setGlobalPrefix('api');
  const origensPermitidas = (
    process.env.FRONTEND_URL ??
    'http://oafdzpwo8yp0jyvtm9eldq2j.187.33.201.107.sslip.io,http://localhost:4200'
  )
    .split(',')
    .map((origem) => origem.trim());
  aplicacao.enableCors({ origin: origensPermitidas });
  aplicacao.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const porta = process.env.PORT ?? 3000;
  await aplicacao.listen(porta, '0.0.0.0');
  console.log(`API do Autocenter disponivel em http://localhost:${porta}/api`);
}

inicializarAplicacao();
