import test from 'node:test';
import assert from 'node:assert/strict';

import { diasParado, limiteDeParado, estaParado } from '../lib/parado.js';

const HOJE = '2026-11-15';

test('conta os dias desde o último movimento', () => {
  assert.equal(diasParado('2026-11-15T09:00:00Z', HOJE), 0);
  assert.equal(diasParado('2026-11-14T09:00:00Z', HOJE), 1);
  assert.equal(diasParado('2026-10-16T09:00:00Z', HOJE), 30);
});

test('sem data de movimento, não inventa atraso', () => {
  assert.equal(diasParado(null, HOJE), null);
  assert.equal(diasParado(undefined, HOJE), null);
  assert.equal(diasParado('', HOJE), null);
});

test('lead aguenta menos tempo parado que projeto', () => {
  // Projeto de meses pode passar duas semanas sem registro e estar normal;
  // lead parado duas semanas já é sinal de que esfriou.
  assert.equal(limiteDeParado('Contato'), 14);
  assert.equal(limiteDeParado('Proposta enviada'), 14);
  assert.equal(limiteDeParado('Negociação'), 14);
  assert.equal(limiteDeParado('Em andamento'), 21);
  assert.equal(limiteDeParado('Em risco'), 21);
});

test('etapa encerrada não tem limite: não existe projeto parado que já acabou', () => {
  assert.equal(limiteDeParado('Perdido'), null);
  assert.equal(limiteDeParado('Concluído'), null);
  assert.equal(limiteDeParado('Encerrado'), null);
});

test('estaParado respeita o limite da etapa', () => {
  const emCima = (etapa, dias) => estaParado({ etapa, ultimoEm: recuar(dias) }, HOJE);

  assert.equal(emCima('Negociação', 13), false);
  assert.equal(emCima('Negociação', 14), true);
  assert.equal(emCima('Em andamento', 14), false, 'cobrou projeto cedo demais');
  assert.equal(emCima('Em andamento', 21), true);
  assert.equal(emCima('Concluído', 90), false, 'cobrou negócio já encerrado');
});

test('negócio sem movimento registrado não conta como parado', () => {
  assert.equal(estaParado({ etapa: 'Negociação', ultimoEm: null }, HOJE), false);
});

function recuar(dias) {
  const d = new Date(HOJE + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString();
}
