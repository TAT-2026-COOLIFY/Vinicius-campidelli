/** Retorna a data atual no formato ISO (aaaa-mm-dd). */
export function dataDeHoje(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Arredonda um valor monetario para duas casas decimais. */
export function arredondarMoeda(valor: number): number {
  return Math.round(valor * 100) / 100;
}
