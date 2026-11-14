import { test } from 'node:test';
import assert from 'node:assert/strict';

import { criarTarefa, moverTarefa } from '../lib/tarefas.js';
import { COLUNAS_TAREFA } from '../lib/funil.js';
import { criarLancamento } from '../lib/lancamentos.js';

function bancoFalso({ usuario = { id: 'u1' }, pessoa = { id: 'u1', nome: 'Ricardo', papel: 'admin', ativo: true } } = {}) {
  const gravou = { insert: [], update: [] };
  return {
    gravou,
    auth: { getUser: async () => ({ data: { user: usuario }, error: null }) },
    from(tabela) {
      if (tabela === 'pessoa') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: pessoa, error: null }) }) }) };
      }
      return {
        insert: (v) => {
          gravou.insert.push(v);
          return { select: () => ({ single: async () => ({ data: { id: 'novo' }, error: null }) }) };
        },
        update: (v) => {
          gravou.update.push(v);
          return { eq: async () => ({ error: null }) };
        },
      };
    },
  };
}

test('as colunas da tarefa são as mesmas do banco', () => {
  assert.deepEqual(COLUNAS_TAREFA, ['Para depois', 'A fazer', 'Fazendo', 'Aguardando', 'Feito']);
});

test('criarTarefa exige título', async () => {
  const b = bancoFalso();
  await assert.rejects(() => criarTarefa(b, 'neg-1', { titulo: '  ' }), /título/i);
  assert.deepEqual(b.gravou.insert, []);
});

test('criarTarefa recusa prazo em formato errado', async () => {
  const b = bancoFalso();
  await assert.rejects(() => criarTarefa(b, 'neg-1', { titulo: 'Ligar', prazo: '21/11/2026' }), /data/i);
  assert.deepEqual(b.gravou.insert, []);
});

test('criarTarefa nasce em A fazer', async () => {
  const b = bancoFalso();
  await criarTarefa(b, 'neg-1', { titulo: 'Ligar para a secretaria', prazo: '2026-11-21' });
  assert.equal(b.gravou.insert[0].coluna, 'A fazer');
  assert.equal(b.gravou.insert[0].negocio_id, 'neg-1');
  assert.equal(b.gravou.insert[0].prazo, '2026-11-21');
});

test('moverTarefa recusa coluna inventada', async () => {
  const b = bancoFalso();
  await assert.rejects(() => moverTarefa(b, 't1', 'Qualquer'), /coluna/i);
  assert.deepEqual(b.gravou.update, []);
});

test('mover para Feito carimba a conclusão, e sair de Feito apaga o carimbo', async () => {
  const b = bancoFalso();
  await moverTarefa(b, 't1', 'Feito');
  assert.ok(b.gravou.update[0].concluido_em, 'não carimbou a conclusão');

  await moverTarefa(b, 't1', 'Fazendo');
  assert.equal(b.gravou.update[1].concluido_em, null, 'deixou o carimbo de uma tarefa reaberta');
});

test('criarLancamento recusa tipo fora de receita e custo', async () => {
  const b = bancoFalso();
  await assert.rejects(() => criarLancamento(b, 'neg-1', { tipo: 'imposto', valor: '10' }), /tipo/i);
  assert.deepEqual(b.gravou.insert, []);
});

test('criarLancamento exige valor e rubrica', async () => {
  const b = bancoFalso();
  await assert.rejects(() => criarLancamento(b, 'neg-1', { tipo: 'receita', rubrica: 'X', valor: '' }), /valor/i);
  await assert.rejects(() => criarLancamento(b, 'neg-1', { tipo: 'receita', rubrica: ' ', valor: '10' }), /rubrica/i);
  assert.deepEqual(b.gravou.insert, []);
});

test('criarLancamento converte o valor digitado', async () => {
  const b = bancoFalso();
  await criarLancamento(b, 'neg-1', { tipo: 'custo', rubrica: 'Hospedagem', valor: '1.200,50' });
  assert.equal(b.gravou.insert[0].valor, 1200.5);
  assert.equal(b.gravou.insert[0].tipo, 'custo');
});

test('lançamento sem sessão não grava nada', async () => {
  const b = bancoFalso({ usuario: null, pessoa: null });
  await assert.rejects(() => criarLancamento(b, 'neg-1', { tipo: 'receita', rubrica: 'X', valor: '10' }), /NEXT_REDIRECT/);
  assert.deepEqual(b.gravou.insert, []);
});
