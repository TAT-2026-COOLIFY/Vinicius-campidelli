import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as path from 'path';
import * as express from 'express';

async function inicializarAplicacao() {
  const aplicacao = await NestFactory.create(AppModule);

  aplicacao.setGlobalPrefix('api');
  aplicacao.enableCors({ origin: (process.env.FRONTEND_URL ?? 'http://localhost:4200').split(',') });
  aplicacao.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const diretorioPublico = path.resolve(__dirname, '..', 'public');
  aplicacao.use(express.static(diretorioPublico));
  aplicacao.use((requisicao, resposta, proximo) => {
    if (requisicao.path.startsWith('/api')) {
      return proximo();
    }
    resposta.sendFile(path.join(diretorioPublico, 'index.html'));
  });

  const porta = process.env.PORT ?? 3000;
  await aplicacao.listen(porta, '0.0.0.0');
  console.log(`Autocenter disponivel em http://localhost:${porta}`);
}

inicializarAplicacao();
