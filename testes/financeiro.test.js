import { test } from 'node:test';
import assert from 'node:assert/strict';
import { somarPorTipo, margem, aReceber } from '../lib/financeiro.js';

const LANCAMENTOS = [
  { tipo: 'receita', valor: '23000.00', pago_em: '2026-07-04' },
  { tipo: 'receita', valor: '23000.00', pago_em: null },
  { tipo: 'custo', valor: '6400.00', pago_em: '2026-10-15' },
];

test('somarPorTipo converte o numeric que vem como texto', () => {
  assert.equal(somarPorTipo(LANCAMENTOS, 'receita'), 46000);
  assert.equal(somarPorTipo(LANCAMENTOS, 'custo'), 6400);
});

test('somarPorTipo de lista vazia é zero', () => {
  assert.equal(somarPorTipo([], 'receita'), 0);
});

test('margem sem receita é null, não divisão por zero', () => {
  assert.equal(margem([{ tipo: 'custo', valor: 500 }]), null);
});

test('margem de lista vazia é null', () => {
  assert.equal(margem([]), null);
});

test('margem é a porcentagem arredondada', () => {
  assert.equal(margem(LANCAMENTOS), 86);
});

test('aReceber conta só receita sem pagamento', () => {
  assert.equal(aReceber(LANCAMENTOS), 23000);
});
