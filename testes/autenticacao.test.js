import test from 'node:test';
import assert from 'node:assert/strict';

import { destinoAposLogin } from '../lib/autenticacao.js';

test('sem destino informado, volta para a raiz do painel', () => {
  assert.equal(destinoAposLogin(null), '/painel');
  assert.equal(destinoAposLogin(undefined), '/painel');
  assert.equal(destinoAposLogin(''), '/painel');
});

test('aceita um caminho interno do painel', () => {
  assert.equal(destinoAposLogin('/painel/leads'), '/painel/leads');
  assert.equal(destinoAposLogin('/painel'), '/painel');
});

test('recusa endereco de outro site', () => {
  assert.equal(destinoAposLogin('https://exemplo-malicioso.com'), '/painel');
  assert.equal(destinoAposLogin('//exemplo-malicioso.com'), '/painel');
  assert.equal(destinoAposLogin('/\\exemplo-malicioso.com'), '/painel');
});

test('recusa caminho fora do painel', () => {
  assert.equal(destinoAposLogin('/'), '/painel');
  assert.equal(destinoAposLogin('/painelzinho'), '/painel');
});
