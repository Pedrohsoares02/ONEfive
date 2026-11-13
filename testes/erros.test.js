import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ehRedirecionamento } from '../lib/erros.js';

test('reconhece o erro de redirecionamento do Next pelo digest', () => {
  assert.equal(ehRedirecionamento({ digest: 'NEXT_REDIRECT;replace;/painel/login;307;' }), true);
});

test('erro comum não é redirecionamento', () => {
  assert.equal(ehRedirecionamento(new Error('Etapa inválida')), false);
  assert.equal(ehRedirecionamento(null), false);
});
