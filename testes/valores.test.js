import test from 'node:test';
import assert from 'node:assert/strict';

import { numeroDeTexto, dataValida } from '../lib/valores.js';

test('numero aceita o jeito que a gente digita', () => {
  assert.equal(numeroDeTexto('38000'), 38000);
  assert.equal(numeroDeTexto('38.000'), 38000);
  assert.equal(numeroDeTexto('38.000,50'), 38000.5);
  assert.equal(numeroDeTexto('38000.50'), 38000.5);
  assert.equal(numeroDeTexto('R$ 1.200'), 1200);
  assert.equal(numeroDeTexto(1200), 1200);
});

test('numero recusa vazio, texto e negativo', () => {
  assert.equal(numeroDeTexto(''), null);
  assert.equal(numeroDeTexto('   '), null);
  assert.equal(numeroDeTexto(null), null);
  assert.equal(numeroDeTexto('abc'), null);
  assert.equal(numeroDeTexto('-5'), null);
});

test('data so passa no formato do banco e se existir no calendario', () => {
  assert.equal(dataValida('2026-11-14'), true);
  assert.equal(dataValida('2026-02-30'), false);
  assert.equal(dataValida('14/11/2026'), false);
  assert.equal(dataValida(''), false);
  assert.equal(dataValida(null), false);
});
