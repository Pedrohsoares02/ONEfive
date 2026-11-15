import test from 'node:test';
import assert from 'node:assert/strict';

import { travasDe, resumoDasTarefas } from '../lib/tarefasVisao.js';

const t = (id, extra = {}) => ({ id, titulo: id, coluna: 'A fazer', depende_de: [], ...extra });

test('trava é só a dependência que ainda não está Feito', () => {
  const todas = [
    t('a', { coluna: 'Feito' }),
    t('b', { coluna: 'Fazendo' }),
    t('c', { depende_de: ['a', 'b'] }),
  ];
  assert.deepEqual(travasDe(todas[2], todas).map((x) => x.id), ['b']);
});

test('dependência que não existe mais não trava nada', () => {
  const todas = [t('c', { depende_de: ['sumiu'] })];
  assert.deepEqual(travasDe(todas[0], todas), []);
});

test('tarefa sem dependência nunca está travada', () => {
  assert.deepEqual(travasDe(t('a'), [t('a')]), []);
});

test('Para depois não entra na conta do realizado', () => {
  const todas = [
    t('a', { coluna: 'Feito' }),
    t('b', { coluna: 'Fazendo' }),
    t('c', { coluna: 'Para depois' }),
    t('d', { coluna: 'Para depois' }),
  ];
  const r = resumoDasTarefas(todas);

  assert.equal(r.consideradas, 2);
  assert.equal(r.feitas, 1);
  assert.equal(r.guardadas, 2);
  assert.equal(r.percentual, 50);
});

test('só com Para depois, não existe percentual para mostrar', () => {
  const r = resumoDasTarefas([t('c', { coluna: 'Para depois' })]);
  assert.equal(r.consideradas, 0);
  assert.equal(r.percentual, null);
});

test('sem tarefa nenhuma, o resumo não quebra', () => {
  const r = resumoDasTarefas([]);
  assert.deepEqual(r, { consideradas: 0, feitas: 0, guardadas: 0, percentual: null, fazendo: 0, esperando: 0 });
});

test('o resumo conta quantas estão em execução e quantas esperam alguém', () => {
  const todas = [
    t('a', { coluna: 'Fazendo' }), t('b', { coluna: 'Fazendo' }),
    t('c', { coluna: 'Aguardando' }), t('d', { coluna: 'A fazer' }),
  ];
  const r = resumoDasTarefas(todas);
  assert.equal(r.fazendo, 2);
  assert.equal(r.esperando, 1);
});
