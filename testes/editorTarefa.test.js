import test from 'node:test';
import assert from 'node:assert/strict';

import { salvarTarefa } from '../lib/tarefas.js';

function bancoFalso({ usuario = { id: 'u1' }, pessoa = { id: 'u1', nome: 'R', papel: 'admin', ativo: true } } = {}) {
  const gravou = { insert: [], update: [] };
  return {
    gravou,
    auth: { getUser: async () => ({ data: { user: usuario }, error: null }) },
    from(tabela) {
      if (tabela === 'pessoa') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: pessoa, error: null }) }) }) };
      }
      return {
        insert: (v) => { gravou.insert.push(v); return { select: () => ({ single: async () => ({ data: { id: 'nova' }, error: null }) }) }; },
        update: (v) => { gravou.update.push(v); return { eq: async () => ({ error: null }) }; },
      };
    },
  };
}

const basico = { titulo: 'Ligar para a secretaria', coluna: 'A fazer' };

test('sem id, cria; com id, altera', async () => {
  const b = bancoFalso();
  await salvarTarefa(b, { negocioId: 'n1', ...basico });
  assert.equal(b.gravou.insert.length, 1);
  assert.equal(b.gravou.update.length, 0);

  await salvarTarefa(b, { id: 't1', negocioId: 'n1', ...basico });
  assert.equal(b.gravou.update.length, 1);
});

test('exige título e recusa coluna inventada', async () => {
  const b = bancoFalso();
  await assert.rejects(() => salvarTarefa(b, { negocioId: 'n1', titulo: '  ', coluna: 'A fazer' }), /título/i);
  await assert.rejects(() => salvarTarefa(b, { negocioId: 'n1', titulo: 'x', coluna: 'Qualquer' }), /coluna/i);
  assert.deepEqual(b.gravou.insert, []);
});

test('fora de Aguardando, a espera é apagada', async () => {
  const b = bancoFalso();
  await salvarTarefa(b, { id: 't1', negocioId: 'n1', titulo: 'x', coluna: 'Fazendo', esperaQuem: 'Jurídico' });
  assert.equal(b.gravou.update[0].espera_quem, null);
  assert.equal(b.gravou.update[0].espera_desde, null);
});

test('em Aguardando, a espera é gravada com a data de hoje', async () => {
  const b = bancoFalso();
  await salvarTarefa(b, { id: 't1', negocioId: 'n1', titulo: 'x', coluna: 'Aguardando', esperaQuem: ' Jurídico ' });
  assert.equal(b.gravou.update[0].espera_quem, 'Jurídico');
  assert.match(b.gravou.update[0].espera_desde, /^\d{4}-\d{2}-\d{2}$/);
});

test('uma tarefa não pode depender de si mesma', async () => {
  const eu = '11111111-1111-4111-8111-111111111111';
  const outra = '22222222-2222-4222-8222-222222222222';
  const b = bancoFalso();
  await salvarTarefa(b, { id: eu, negocioId: 'n1', ...basico, dependeDe: [eu, outra] });
  assert.deepEqual(b.gravou.update[0].depende_de, [outra]);
});

test('dependência que não é identificador de verdade é descartada', async () => {
  const b = bancoFalso();
  await salvarTarefa(b, { negocioId: 'n1', ...basico, dependeDe: ['', 'qualquer-coisa', null] });
  assert.deepEqual(b.gravou.insert[0].depende_de, []);
});

test('marcar Feito carimba a conclusão; sair de Feito apaga', async () => {
  const b = bancoFalso();
  await salvarTarefa(b, { id: 't1', negocioId: 'n1', titulo: 'x', coluna: 'Feito' });
  assert.ok(b.gravou.update[0].concluido_em);

  await salvarTarefa(b, { id: 't1', negocioId: 'n1', titulo: 'x', coluna: 'Fazendo' });
  assert.equal(b.gravou.update[1].concluido_em, null);
});

test('prazo em formato errado é recusado', async () => {
  const b = bancoFalso();
  await assert.rejects(() => salvarTarefa(b, { negocioId: 'n1', ...basico, prazo: '21/11/2026' }), /data/i);
  assert.deepEqual(b.gravou.insert, []);
});

test('campos vazios viram nulo, e não texto em branco', async () => {
  const b = bancoFalso();
  await salvarTarefa(b, { negocioId: 'n1', ...basico, prazo: '', responsavelId: '', observacoes: '   ' });
  const g = b.gravou.insert[0];
  assert.equal(g.prazo, null);
  assert.equal(g.responsavel_id, null);
  assert.equal(g.observacoes, null);
});

test('sem sessão não grava nada', async () => {
  const b = bancoFalso({ usuario: null, pessoa: null });
  await assert.rejects(() => salvarTarefa(b, { negocioId: 'n1', ...basico }), /NEXT_REDIRECT/);
  assert.deepEqual(b.gravou.insert, []);
});
