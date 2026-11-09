import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracao } from '../../modelos';
import { AtualizarConfiguracaoDto } from './configuracao.dto';

@Injectable()
export class ConfiguracoesService {
  constructor(
    @InjectRepository(Configuracao) private readonly configuracaoRepositorio: Repository<Configuracao>,
  ) {}

  /** Retorna a configuracao da oficina, criando o registro padrao na primeira execucao. */
  async obterConfiguracao(): Promise<Configuracao> {
    const [existente] = await this.configuracaoRepositorio.find({ take: 1 });
    if (existente) return existente;
    return this.configuracaoRepositorio.save(this.configuracaoRepositorio.create({}));
  }

  /** Atualiza os dados cadastrais e as preferencias operacionais da oficina. */
  async atualizarConfiguracao(dados: AtualizarConfiguracaoDto): Promise<Configuracao> {
    const configuracao = await this.obterConfiguracao();
    Object.assign(configuracao, dados);
    return this.configuracaoRepositorio.save(configuracao);
  }
}
