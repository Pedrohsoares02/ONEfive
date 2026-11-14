/* Conversões de texto digitado para o que o banco aceita.
   Tudo aqui é função pura: a validação roda no servidor, mas a mesma
   regra precisa valer na tela para o usuário não levar erro à toa. */

/* Aceita 38000, 38.000, 38.000,50, 38000.50 e "R$ 1.200".
   Devolve null para vazio, texto e negativo — a tabela tem CHECK >= 0. */
export function numeroDeTexto(bruto) {
  if (bruto === null || bruto === undefined) return null;
  const s = String(bruto).replace(/[^\d,.-]/g, '').trim();
  if (!s) return null;
  // Com vírgula, ela é a decimal e o ponto é milhar: 38.000,50 → 38000.50
  // Sem vírgula, o ponto só é milhar quando separa grupos de três:
  // 38.000 → 38000, mas 38000.50 e 1.5 continuam decimais.
  const milhar = /^\d{1,3}(\.\d{3})+$/;
  const limpo = s.includes(',')
    ? s.replace(/\./g, '').replace(',', '.')
    : milhar.test(s) ? s.replace(/\./g, '') : s;
  const n = Number(limpo);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

/* O banco guarda date; só passa AAAA-MM-DD que exista no calendário.
   "2026-02-30" vira 02/03 se a gente deixar o Date corrigir sozinho. */
export function dataValida(texto) {
  if (typeof texto !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const d = new Date(texto + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto;
}

export function textoLimpo(bruto) {
  const s = String(bruto ?? '').trim();
  return s === '' ? null : s;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function ehIdentificador(texto) {
  return typeof texto === 'string' && UUID.test(texto);
}
