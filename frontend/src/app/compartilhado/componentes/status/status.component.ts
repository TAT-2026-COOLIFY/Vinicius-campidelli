import { NgClass } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';
import {
  ROTULOS_SITUACAO_AGENDAMENTO,
  ROTULOS_SITUACAO_SERVICO,
  ROTULOS_STATUS_ORDEM,
  ROTULOS_TIPO_MOVIMENTACAO,
  CorSelo,
} from '../../utilitarios/rotulos';

type OrigemSelo = 'ordem' | 'agendamento' | 'movimentacao' | 'servico';

/** Selo discreto que traduz um status tecnico em rotulo legivel */
@Component({
  selector: 'app-status',
  standalone: true,
  imports: [NgClass],
  templateUrl: './status.component.html',
})
export class StatusComponent {
  private readonly valorStatus = signal<string>('');
  private readonly origemSelo = signal<OrigemSelo>('ordem');

  @Input({ required: true }) set status(valor: string) {
    this.valorStatus.set(valor);
  }

  @Input() set origem(valor: OrigemSelo) {
    this.origemSelo.set(valor);
  }

  protected readonly definicao = computed(() => {
    const dicionarios: Record<OrigemSelo, Record<string, { rotulo: string; cor: CorSelo }>> = {
      ordem: ROTULOS_STATUS_ORDEM,
      agendamento: ROTULOS_SITUACAO_AGENDAMENTO,
      movimentacao: ROTULOS_TIPO_MOVIMENTACAO,
      servico: ROTULOS_SITUACAO_SERVICO,
    };
    return (
      dicionarios[this.origemSelo()][this.valorStatus()] ?? {
        rotulo: this.valorStatus(),
        cor: 'neutro' as CorSelo,
      }
    );
  });

  protected readonly classesCor = computed(() => {
    const mapa: Record<CorSelo, string> = {
      neutro: 'bg-slate-100 text-slate-600 ring-slate-200',
      informacao: 'bg-marca-50 text-marca-700 ring-marca-100',
      progresso: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
      atencao: 'bg-amber-50 text-amber-700 ring-amber-100',
      sucesso: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      erro: 'bg-rose-50 text-rose-700 ring-rose-100',
    };
    return mapa[this.definicao().cor];
  });

  protected readonly classesPonto = computed(() => {
    const mapa: Record<CorSelo, string> = {
      neutro: 'bg-slate-400',
      informacao: 'bg-marca-500',
      progresso: 'bg-indigo-500',
      atencao: 'bg-amber-500',
      sucesso: 'bg-emerald-500',
      erro: 'bg-rose-500',
    };
    return mapa[this.definicao().cor];
  });
}
