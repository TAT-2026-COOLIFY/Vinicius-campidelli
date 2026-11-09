import { Body, Controller, Get, Put } from '@nestjs/common';
import { AtualizarConfiguracaoDto } from './configuracao.dto';
import { ConfiguracoesService } from './configuracoes.service';

@Controller('configuracoes')
export class ConfiguracoesController {
  constructor(private readonly configuracoesService: ConfiguracoesService) {}

  @Get()
  obter() {
    return this.configuracoesService.obterConfiguracao();
  }

  @Put()
  atualizar(@Body() dados: AtualizarConfiguracaoDto) {
    return this.configuracoesService.atualizarConfiguracao(dados);
  }
}
