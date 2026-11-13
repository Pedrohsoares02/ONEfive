/* O Postgres devolve numeric como texto; somar sem converter concatena. */
function numero(valor) {
  const v = Number(valor);
  return Number.isFinite(v) ? v : 0;
}

export function somarPorTipo(lancamentos, tipo) {
  return lancamentos.reduce((t, l) => (l.tipo === tipo ? t + numero(l.valor) : t), 0);
}

/** Porcentagem arredondada. Sem receita não existe margem — devolve null em vez de dividir por zero. */
export function margem(lancamentos) {
  const receita = somarPorTipo(lancamentos, 'receita');
  if (receita === 0) return null;
  const custo = somarPorTipo(lancamentos, 'custo');
  return Math.round(((receita - custo) / receita) * 100);
}

/** Receita lançada que ainda não entrou. */
export function aReceber(lancamentos) {
  return lancamentos.reduce(
    (t, l) => (l.tipo === 'receita' && !l.pago_em ? t + numero(l.valor) : t),
    0
  );
}
