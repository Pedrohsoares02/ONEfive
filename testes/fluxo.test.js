import test from 'node:test';
import assert from 'node:assert/strict';

import { tarefasDoFluxo, niveisPorDependencia, arranjar } from '../lib/fluxo.js';

const t = (id, extra = {}) => ({
  id, titulo: id, coluna: 'A fazer', depende_de: [], posicao_x: null, posicao_y: null, ...extra,
});

test('o nível é um a mais que o da dependência mais tardia', () => {
  const tarefas = [
    t('a'),
    t('b', { depende_de: ['a'] }),
    t('c', { depende_de: ['a'] }),
    t('d', { depende_de: ['b', 'c'] }),
  ];
  const n = niveisPorDependencia(tarefas);

  assert.equal(n.get('a'), 1);
  assert.equal(n.get('b'), 2);
  assert.equal(n.get('c'), 2);
  assert.equal(n.get('d'), 3);
});

test('dependência que aponta para tarefa inexistente é ignorada', () => {
  const n = niveisPorDependencia([t('a', { depende_de: ['fantasma'] })]);
  assert.equal(n.get('a'), 1);
});

test('ciclo não trava e não estoura a pilha', () => {
  // A→B→C→A: não deveria existir, mas o banco aceita. Se o cálculo entrar em
  // laço aqui, a página inteira morre.
  const tarefas = [
    t('a', { depende_de: ['c'] }),
    t('b', { depende_de: ['a'] }),
    t('c', { depende_de: ['b'] }),
  ];
  const n = niveisPorDependencia(tarefas);

  // Num ciclo o número que sai é arbitrário — alguém tem de ser "o primeiro".
  // O que importa é terminar, dar nível a todas e nenhum ser absurdo.
  assert.equal(n.size, 3);
  n.forEach((v) => assert.ok(Number.isFinite(v) && v >= 1, 'nível inválido: ' + v));

  // e o desenho tem de sair, em vez de quebrar a página
  assert.equal(arranjar(tarefas).size, 3);
});

test('sem nenhuma ligação, entram todas menos as de Para depois', () => {
  const tarefas = [t('a'), t('b'), t('c', { coluna: 'Para depois' })];
  assert.deepEqual(tarefasDoFluxo(tarefas).map((x) => x.id), ['a', 'b']);
});

test('havendo ligação, só entram as ligadas e as que alguém posicionou', () => {
  const tarefas = [
    t('a'),
    t('b', { depende_de: ['a'] }),
    t('solta'),
    t('fixada', { posicao_x: 100, posicao_y: 50 }),
  ];
  assert.deepEqual(tarefasDoFluxo(tarefas).map((x) => x.id), ['a', 'b', 'fixada']);
});

test('arranjar põe cada nível numa coluna, da esquerda para a direita', () => {
  const tarefas = [t('a'), t('b', { depende_de: ['a'] })];
  const pos = arranjar(tarefas);
  assert.ok(pos.get('b').x > pos.get('a').x, 'a dependente não ficou à direita');
});

test('arranjar respeita a posição que alguém arrastou', () => {
  const tarefas = [t('a', { posicao_x: 777, posicao_y: 333 })];
  assert.deepEqual(arranjar(tarefas).get('a'), { x: 777, y: 333 });
});

test('irmãs do mesmo nível não se sobrepõem', () => {
  const tarefas = [t('a'), t('b', { depende_de: ['a'] }), t('c', { depende_de: ['a'] })];
  const pos = arranjar(tarefas);
  assert.equal(pos.get('b').x, pos.get('c').x, 'irmãs saíram de colunas diferentes');
  assert.notEqual(pos.get('b').y, pos.get('c').y, 'irmãs ficaram uma em cima da outra');
});
