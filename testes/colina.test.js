import test from 'node:test';
import assert from 'node:assert/strict';

import { posicaoDaColina, ladoDaColina, trilhaDosEventos } from '../lib/colina.js';
import { moverColina } from '../lib/negocios.js';

test('sem posição confirmada, a etapa sugere onde a bolinha fica', () => {
  assert.deepEqual(posicaoDaColina({ etapa: 'Contato', colina: null }), { pos: 8, sugerida: true });
  assert.deepEqual(posicaoDaColina({ etapa: 'Negociação', colina: null }), { pos: 80, sugerida: true });
  assert.deepEqual(posicaoDaColina({ etapa: 'Em andamento', colina: null }), { pos: 40, sugerida: true });
});

test('posição confirmada vence a sugestão da etapa', () => {
  assert.deepEqual(posicaoDaColina({ etapa: 'Contato', colina: 73 }), { pos: 73, sugerida: false });
  // zero é posição de verdade, não "vazio"
  assert.deepEqual(posicaoDaColina({ etapa: 'Negociação', colina: 0 }), { pos: 0, sugerida: false });
});

test('etapa desconhecida cai no começo da colina', () => {
  assert.deepEqual(posicaoDaColina({ etapa: 'Inventada', colina: null }), { pos: 8, sugerida: true });
});

test('o lado da colina muda de sentido entre lead e projeto', () => {
  assert.equal(ladoDaColina(20, true), 'Entendendo o que ele precisa');
  assert.equal(ladoDaColina(70, true), 'Fechando');
  assert.equal(ladoDaColina(20, false), 'Entendendo o problema');
  assert.equal(ladoDaColina(70, false), 'Implantando a solução');
  // 50 já é o lado de lá: metade do morro vencida
  assert.equal(ladoDaColina(50, false), 'Implantando a solução');
});

test('a trilha sai dos eventos de colina, da mais antiga para a mais nova', () => {
  const eventos = [
    { negocio_id: 'n1', acao: 'Colina', detalhe: '30% → 58%', criado_em: '2026-10-29T10:00:00Z' },
    { negocio_id: 'n1', acao: 'Etapa alterada', detalhe: 'x para y', criado_em: '2026-10-30T10:00:00Z' },
    { negocio_id: 'n1', acao: 'Colina', detalhe: 'posição sugerida → 30%', criado_em: '2026-10-20T10:00:00Z' },
    { negocio_id: 'n2', acao: 'Colina', detalhe: '10% → 20%', criado_em: '2026-10-21T10:00:00Z' },
  ];
  const t = trilhaDosEventos(eventos);

  assert.deepEqual(t.get('n1').map((m) => m.pos), [30, 58]);
  assert.equal(t.get('n1')[0].quando, '2026-10-20T10:00:00Z');
  assert.deepEqual(t.get('n2').map((m) => m.pos), [20]);
});

test('a trilha guarda no máximo seis passos', () => {
  const eventos = Array.from({ length: 10 }, (_, i) => ({
    negocio_id: 'n1', acao: 'Colina', detalhe: `${i}% → ${i + 1}%`,
    criado_em: `2026-10-0${(i % 9) + 1}T10:00:00Z`,
  }));
  assert.equal(trilhaDosEventos(eventos).get('n1').length, 6);
});

/* ---- gravação ---- */
function bancoFalso({ usuario = { id: 'u1' }, pessoa = { id: 'u1', nome: 'R', papel: 'admin', ativo: true } } = {}) {
  const gravou = [];
  return {
    gravou,
    auth: { getUser: async () => ({ data: { user: usuario }, error: null }) },
    from(tabela) {
      if (tabela === 'pessoa') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: pessoa, error: null }) }) }) };
      }
      return { update: (v) => { gravou.push(v); return { eq: async () => ({ error: null }) }; } };
    },
  };
}

test('moverColina recusa posição fora de 0 a 100', async () => {
  const b = bancoFalso();
  await assert.rejects(() => moverColina(b, 'n1', 101), /posição/i);
  await assert.rejects(() => moverColina(b, 'n1', -1), /posição/i);
  await assert.rejects(() => moverColina(b, 'n1', 'meio'), /posição/i);
  assert.deepEqual(b.gravou, []);
});

test('moverColina arredonda e grava', async () => {
  const b = bancoFalso();
  await moverColina(b, 'n1', 58.6);
  assert.equal(b.gravou[0].colina, 59);
});

test('moverColina sem sessão não grava nada', async () => {
  const b = bancoFalso({ usuario: null, pessoa: null });
  await assert.rejects(() => moverColina(b, 'n1', 50), /NEXT_REDIRECT/);
  assert.deepEqual(b.gravou, []);
});
