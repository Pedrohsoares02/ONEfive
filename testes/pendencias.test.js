import test from 'node:test';
import assert from 'node:assert/strict';

import { pendencias } from '../lib/pendencias.js';

const HOJE = '2026-11-15';

const negocio = (extra) => ({
  id: 'n1', codigo: 'NEG-001', titulo: 'Diagnóstico',
  etapa: 'Contato', valor_previsto: 1000,
  atualizado_em: '2026-11-14T10:00:00Z',
  fechamento_previsto: null,
  cliente: { nome: 'Prefeitura' },
  contatos: 1,
  ...extra,
});

const achar = (lista, tipo) => lista.filter((p) => p.tipo === tipo);

test('painel limpo não inventa pendência', () => {
  const r = pendencias({ negocios: [negocio()], tarefas: [], hoje: HOJE });
  assert.deepEqual(r, []);
});

test('proposta enviada e parada há dez dias vira cobrança', () => {
  const parada = negocio({ etapa: 'Proposta enviada', atualizado_em: '2026-11-05T10:00:00Z' });
  const recente = negocio({ id: 'n2', etapa: 'Proposta enviada', atualizado_em: '2026-11-13T10:00:00Z' });

  const r = pendencias({ negocios: [parada, recente], tarefas: [], hoje: HOJE });
  const cobrancas = achar(r, 'proposta-parada');

  assert.equal(cobrancas.length, 1, 'cobrou proposta que teve movimento esta semana');
  assert.equal(cobrancas[0].negocioId, 'n1');
  assert.match(cobrancas[0].motivo, /10 dias/);
});

test('projeto em risco aparece sempre', () => {
  const r = pendencias({ negocios: [negocio({ etapa: 'Em risco' })], tarefas: [], hoje: HOJE });
  assert.equal(achar(r, 'em-risco').length, 1);
});

test('fechamento nos próximos sete dias aparece; o de mês que vem não', () => {
  const perto = negocio({ etapa: 'Negociação', fechamento_previsto: '2026-11-18' });
  const longe = negocio({ id: 'n2', etapa: 'Negociação', fechamento_previsto: '2026-12-20' });

  const r = pendencias({ negocios: [perto, longe], tarefas: [], hoje: HOJE });
  const f = achar(r, 'fechamento-perto');

  assert.equal(f.length, 1);
  assert.equal(f[0].negocioId, 'n1');
});

test('fechamento que já passou é atraso, não aviso', () => {
  const r = pendencias({
    negocios: [negocio({ etapa: 'Negociação', fechamento_previsto: '2026-11-10' })],
    tarefas: [], hoje: HOJE,
  });
  assert.equal(achar(r, 'fechamento-perto').length, 0);
  assert.equal(achar(r, 'fechamento-vencido').length, 1);
});

test('negócio sem contato cadastrado pede cadastro', () => {
  const r = pendencias({ negocios: [negocio({ contatos: 0 })], tarefas: [], hoje: HOJE });
  assert.equal(achar(r, 'sem-contato').length, 1);
});

test('lead além de Contato e sem valor pede valor; em Contato, não', () => {
  const sem = negocio({ etapa: 'Diagnóstico', valor_previsto: null });
  const novo = negocio({ id: 'n2', etapa: 'Contato', valor_previsto: null });

  const r = pendencias({ negocios: [sem, novo], tarefas: [], hoje: HOJE });
  const v = achar(r, 'sem-valor');

  assert.equal(v.length, 1);
  assert.equal(v[0].negocioId, 'n1');
});

test('tarefa vencida e não concluída vira pendência', () => {
  const tarefas = [
    { id: 't1', titulo: 'Ligar', prazo: '2026-11-10', coluna: 'A fazer', negocio_id: 'n1' },
    { id: 't2', titulo: 'Feita', prazo: '2026-11-10', coluna: 'Feito', negocio_id: 'n1' },
    { id: 't3', titulo: 'Futura', prazo: '2026-11-30', coluna: 'A fazer', negocio_id: 'n1' },
  ];
  const r = pendencias({ negocios: [negocio()], tarefas, hoje: HOJE });
  const t = achar(r, 'tarefa-atrasada');

  assert.equal(t.length, 1);
  assert.match(t[0].titulo, /Ligar/);
});

test('negócio encerrado ou perdido não gera pendência', () => {
  const r = pendencias({
    negocios: [
      negocio({ etapa: 'Perdido', contatos: 0, valor_previsto: null }),
      negocio({ id: 'n2', etapa: 'Encerrado', contatos: 0, valor_previsto: null }),
      negocio({ id: 'n3', etapa: 'Concluído', contatos: 0, valor_previsto: null }),
    ],
    tarefas: [], hoje: HOJE,
  });
  assert.deepEqual(r, []);
});

test('o mais urgente vem primeiro', () => {
  const r = pendencias({
    negocios: [
      negocio({ id: 'n1', etapa: 'Diagnóstico', valor_previsto: null }),
      negocio({ id: 'n2', etapa: 'Em risco' }),
    ],
    tarefas: [], hoje: HOJE,
  });
  assert.equal(r[0].tipo, 'em-risco', 'deixou um projeto em risco abaixo de um campo em branco');
});
