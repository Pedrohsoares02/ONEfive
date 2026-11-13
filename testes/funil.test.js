import { test } from 'node:test';
import assert from 'node:assert/strict';
import { previsaoDoFunil, ETAPAS_LEAD, ETAPAS_PROJETO, ehLead, meusNegocios } from '../lib/funil.js';

test('previsão ignora negócio sem valor e não vira NaN', () => {
  const r = previsaoDoFunil([{ valor_previsto: null }, { valor_previsto: 1000 }]);
  assert.equal(r, 1000);
});

test('previsão de funil vazio é zero', () => {
  assert.equal(previsaoDoFunil([]), 0);
});

test('previsão soma valor vindo como texto do Postgres (numeric)', () => {
  // o driver devolve numeric como string; somar sem converter concatena
  assert.equal(previsaoDoFunil([{ valor_previsto: '1500.00' }, { valor_previsto: '500.50' }]), 2000.5);
});

test('previsão ignora valor ilegível em vez de virar NaN', () => {
  assert.equal(previsaoDoFunil([{ valor_previsto: 'abc' }, { valor_previsto: 200 }]), 200);
});

test('as cinco etapas de lead e as quatro de projeto não se sobrepõem', () => {
  assert.equal(ETAPAS_LEAD.length, 5);
  assert.equal(ETAPAS_PROJETO.length, 4);
  assert.equal(ETAPAS_LEAD.filter((e) => ETAPAS_PROJETO.includes(e)).length, 0);
});

test('ehLead separa lead de projeto pela etapa', () => {
  assert.equal(ehLead({ etapa: 'Negociação' }), true);
  assert.equal(ehLead({ etapa: 'Em andamento' }), false);
});

test('meusNegocios filtra pelo id do dono, não pelo nome', () => {
  const lista = [
    { id: 'a', dono_id: 'u1', etapa: 'Negociação' },
    { id: 'b', dono_id: 'u2', etapa: 'Negociação' },
    { id: 'c', dono_id: 'u1', etapa: 'Concluído' },
    { id: 'd', dono_id: null, etapa: 'Contato' },
  ];
  const meus = meusNegocios(lista, 'u1');
  assert.deepEqual(meus.map((n) => n.id), ['a']);
});

test('meusNegocios sem dono definido devolve lista vazia', () => {
  assert.deepEqual(meusNegocios([{ id: 'a', dono_id: null, etapa: 'Contato' }], null), []);
});
