import test from 'node:test';
import assert from 'node:assert/strict';

import { validarCampo } from '../lib/campos.js';

test('recusa campo que nao esta na lista', () => {
  // O nome do campo vem do navegador: sem essa trava daria para
  // escrever em qualquer coluna da tabela.
  assert.equal(validarCampo('codigo', 'NEG-999').ok, false);
  assert.equal(validarCampo('id', 'x').ok, false);
  assert.equal(validarCampo('criado_em', '2020-01-01').ok, false);
});

test('etapa so aceita as etapas do funil', () => {
  assert.deepEqual(validarCampo('etapa', 'Negociação'), { ok: true, valor: 'Negociação' });
  assert.deepEqual(validarCampo('etapa', 'Em andamento'), { ok: true, valor: 'Em andamento' });
  assert.equal(validarCampo('etapa', 'Qualquer coisa').ok, false);
  assert.equal(validarCampo('etapa', '').ok, false);
});

test('valor previsto vira numero, e vazio limpa o campo', () => {
  assert.deepEqual(validarCampo('valor_previsto', '38.000'), { ok: true, valor: 38000 });
  assert.deepEqual(validarCampo('valor_previsto', ''), { ok: true, valor: null });
  assert.equal(validarCampo('valor_previsto', 'abc').ok, false);
});

test('datas passam no formato do banco', () => {
  assert.deepEqual(validarCampo('fechamento_previsto', '2026-12-15'), { ok: true, valor: '2026-12-15' });
  assert.deepEqual(validarCampo('inicio', ''), { ok: true, valor: null });
  assert.equal(validarCampo('prazo', '15/12/2026').ok, false);
});

test('texto chega limpo e vazio vira nulo', () => {
  assert.deepEqual(validarCampo('observacoes', '  nota  '), { ok: true, valor: 'nota' });
  assert.deepEqual(validarCampo('observacoes', '   '), { ok: true, valor: null });
});

test('titulo nao pode ficar vazio', () => {
  assert.deepEqual(validarCampo('titulo', ' Diagnóstico '), { ok: true, valor: 'Diagnóstico' });
  assert.equal(validarCampo('titulo', '   ').ok, false);
});

test('dono so aceita identificador de verdade', () => {
  const id = '3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
  assert.deepEqual(validarCampo('dono_id', id), { ok: true, valor: id });
  assert.deepEqual(validarCampo('dono_id', ''), { ok: true, valor: null });
  assert.equal(validarCampo('dono_id', 'ricardo').ok, false);
});
