import {
  FormaPagamento,
  SituacaoAgendamento,
  SituacaoServico,
  StatusOrdem,
  TipoItemOrdem,
  TipoMovimentacao,
} from '../../nucleo/modelos';

/** Aparencia visual de um selo de status */
export type CorSelo = 'neutro' | 'informacao' | 'progresso' | 'atencao' | 'sucesso' | 'erro';

interface DefinicaoSelo {
  rotulo: string;
  cor: CorSelo;
}

export const ROTULOS_STATUS_ORDEM: Record<StatusOrdem, DefinicaoSelo> = {
  [StatusOrdem.ABERTA]: { rotulo: 'Aberta', cor: 'informacao' },
  [StatusOrdem.AGUARDANDO_ATENDIMENTO]: { rotulo: 'Aguardando atendimento', cor: 'neutro' },
  [StatusOrdem.EM_ANDAMENTO]: { rotulo: 'Em andamento', cor: 'progresso' },
  [StatusOrdem.AGUARDANDO_PECAS]: { rotulo: 'Aguardando peças', cor: 'atencao' },
  [StatusOrdem.CONCLUIDA]: { rotulo: 'Concluída', cor: 'sucesso' },
  [StatusOrdem.CANCELADA]: { rotulo: 'Cancelada', cor: 'erro' },
};

export const ROTULOS_SITUACAO_AGENDAMENTO: Record<SituacaoAgendamento, DefinicaoSelo> = {
  [SituacaoAgendamento.AGENDADO]: { rotulo: 'Agendado', cor: 'informacao' },
  [SituacaoAgendamento.AGUARDANDO_PECA]: { rotulo: 'Aguardando peça', cor: 'atencao' },
  [SituacaoAgendamento.EM_ANDAMENTO]: { rotulo: 'Sendo feito', cor: 'progresso' },
  [SituacaoAgendamento.CONCLUIDO]: { rotulo: 'Concluído', cor: 'sucesso' },
  [SituacaoAgendamento.CANCELADO]: { rotulo: 'Cancelado', cor: 'erro' },
};

export const ROTULOS_SITUACAO_SERVICO: Record<SituacaoServico, DefinicaoSelo> = {
  [SituacaoServico.ATIVO]: { rotulo: 'Ativo', cor: 'sucesso' },
  [SituacaoServico.INATIVO]: { rotulo: 'Inativo', cor: 'neutro' },
};

export const ROTULOS_TIPO_MOVIMENTACAO: Record<TipoMovimentacao, DefinicaoSelo> = {
  [TipoMovimentacao.ENTRADA]: { rotulo: 'Entrada', cor: 'sucesso' },
  [TipoMovimentacao.SAIDA]: { rotulo: 'Saída', cor: 'erro' },
};

export const ROTULOS_TIPO_ITEM: Record<TipoItemOrdem, string> = {
  [TipoItemOrdem.SERVICO]: 'Serviço',
  [TipoItemOrdem.PECA]: 'Peça',
};

export const ROTULOS_FORMA_PAGAMENTO: Record<FormaPagamento, string> = {
  [FormaPagamento.DINHEIRO]: 'Dinheiro',
  [FormaPagamento.PIX]: 'Pix',
  [FormaPagamento.CARTAO_DEBITO]: 'Cartão de débito',
  [FormaPagamento.CARTAO_CREDITO]: 'Cartão de crédito',
  [FormaPagamento.BOLETO]: 'Boleto',
};

/** Converte um dicionario de rotulos em opcoes para dropdowns */
export function gerarOpcoes<T extends string>(
  dicionario: Record<T, DefinicaoSelo | string>,
): { rotulo: string; valor: T }[] {
  return (Object.keys(dicionario) as T[]).map((valor) => {
    const definicao = dicionario[valor];
    return { valor, rotulo: typeof definicao === 'string' ? definicao : definicao.rotulo };
  });
}

/** Descreve um status em texto legivel, independente do modulo de origem */
export function descreverStatus(status: string): string {
  const dicionarios = [
    ROTULOS_STATUS_ORDEM,
    ROTULOS_SITUACAO_AGENDAMENTO,
    ROTULOS_SITUACAO_SERVICO,
    ROTULOS_TIPO_MOVIMENTACAO,
  ] as Record<string, DefinicaoSelo>[];

  for (const dicionario of dicionarios) {
    if (dicionario[status]) return dicionario[status].rotulo;
  }
  return status;
}

/** Descreve uma forma de pagamento aceitando o valor como texto simples */
export function descreverFormaPagamento(valor: string): string {
  return (ROTULOS_FORMA_PAGAMENTO as Record<string, string>)[valor] ?? valor;
}

/** Descreve o tipo de item de uma ordem aceitando o valor como texto simples */
export function descreverTipoItem(valor: string): string {
  return (ROTULOS_TIPO_ITEM as Record<string, string>)[valor] ?? valor;
}
