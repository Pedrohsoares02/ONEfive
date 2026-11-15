import test from 'node:test';
import assert from 'node:assert/strict';

import { alertasDoNegocio, recebimentoVencido } from '../lib/alertas.js';

const HOJE = '2026-11-16';
const NEG = { id: 'n1', codigo: 'NEG-001', titulo: 'Sandbox de inovação', dono_id: 'ricardo' };

const tarefa = (extra) => ({
  id: 't' + Math.random().toString(36).slice(2, 8),
  titulo: 'Tarefa', coluna: 'A fazer', prazo: null, responsavel_id: 'leo',
  urgente: false, depende_de: [], espera_quem: null, espera_desde: null, ...extra,
});

const so = (lista) => lista.map((a) => a.tipo);

test('tarefa feita não gera alerta, mesmo vencida', () => {
  const t = tarefa({ coluna: 'Feito', prazo: '2026-10-01', urgente: true });
  assert.deepEqual(alertasDoNegocio({ negocio: NEG, tarefas: [t], hoje: HOJE }), []);
});

test('urgente vem antes de atrasada, e a mesma tarefa só gera um alerta', () => {
  const t = tarefa({ prazo: '2026-11-10', urgente: true });
  const alertas = alertasDoNegocio({ negocio: NEG, tarefas: [t], hoje: HOJE });
  assert.deepEqual(so(alertas), ['urgente']);
});

test('a ordem é urgente, atrasada, recebimento, aguardando, travada', () => {
  const travada = tarefa({ id: 'tb', titulo: 'Depende', depende_de: ['ta'] });
  const aberta = tarefa({ id: 'ta', titulo: 'Bloqueia' });
  const aguardando = tarefa({ coluna: 'Aguardando', espera_quem: 'Marina', espera_desde: '2026-11-10' });
  const atrasada = tarefa({ prazo: '2026-11-02' });
  const urgente = tarefa({ urgente: true });
  const alertas = alertasDoNegocio({
    negocio: NEG,
    tarefas: [travada, aberta, aguardando, atrasada, urgente],
    lancamentos: [{ tipo: 'receita', valor: 30000, vencimento: '2026-11-11', pago_em: null }],
    hoje: HOJE,
  });
  assert.deepEqual(so(alertas), ['urgente', 'atrasada', 'recebimento', 'aguardando', 'travada']);
});

test('o alerta de espera diz com quem está e há quanto tempo', () => {
  const t = tarefa({ coluna: 'Aguardando', espera_quem: 'Marina Costa', espera_desde: '2026-11-10' });
  const [a] = alertasDoNegocio({ negocio: NEG, tarefas: [t], hoje: HOJE });
  assert.equal(a.explicacao, 'Marina Costa há 6 dias');
});

test('espera de um dia não vira "1 dias"', () => {
  const t = tarefa({ coluna: 'Aguardando', espera_quem: 'Marina', espera_desde: '2026-11-15' });
  const [a] = alertasDoNegocio({ negocio: NEG, tarefas: [t], hoje: HOJE });
  assert.equal(a.explicacao, 'Marina há 1 dia');
});

test('aguardando sem dono da bola avisa que falta registrar', () => {
  const t = tarefa({ coluna: 'Aguardando' });
  const [a] = alertasDoNegocio({ negocio: NEG, tarefas: [t], hoje: HOJE });
  assert.equal(a.explicacao, 'Ninguém registrado');
});

test('travada nomeia a tarefa que segura', () => {
  const bloqueia = tarefa({ id: 'ta', titulo: 'Validar mapa' });
  const travada = tarefa({ id: 'tb', titulo: 'Fechar roteiro', depende_de: ['ta'] });
  const alertas = alertasDoNegocio({ negocio: NEG, tarefas: [bloqueia, travada], hoje: HOJE });
  const t = alertas.find((a) => a.tipo === 'travada');
  assert.equal(t.explicacao, 'Espera Validar mapa');
});

test('dependência já concluída não trava nada', () => {
  const pronta = tarefa({ id: 'ta', titulo: 'Validar mapa', coluna: 'Feito' });
  const depois = tarefa({ id: 'tb', titulo: 'Fechar roteiro', depende_de: ['ta'] });
  assert.deepEqual(so(alertasDoNegocio({ negocio: NEG, tarefas: [pronta, depois], hoje: HOJE })), []);
});

test('o alerta de tarefa aponta para quem responde por ela', () => {
  const t = tarefa({ urgente: true, responsavel_id: 'lucas' });
  const [a] = alertasDoNegocio({ negocio: NEG, tarefas: [t], hoje: HOJE });
  assert.equal(a.pessoaId, 'lucas');
  assert.equal(a.tarefaId, t.id);
});

test('o recebimento vencido é do dono do projeto, não de um responsável', () => {
  const [a] = alertasDoNegocio({
    negocio: NEG, tarefas: [],
    lancamentos: [{ tipo: 'receita', valor: 30000, vencimento: '2026-11-11', pago_em: null }],
    hoje: HOJE,
  });
  assert.equal(a.pessoaId, 'ricardo');
  assert.equal(a.explicacao, 'R$ 30.000 vencidos e em aberto');
  assert.equal(a.tarefaId, null);
});

test('recebimentoVencido soma só receita vencida e não paga', () => {
  const lancamentos = [
    { tipo: 'receita', valor: 30000, vencimento: '2026-11-11', pago_em: null },
    { tipo: 'receita', valor: 50000, vencimento: '2026-11-11', pago_em: '2026-11-12' },
    { tipo: 'receita', valor: 90000, vencimento: '2026-12-01', pago_em: null },
    { tipo: 'custo', valor: 10000, vencimento: '2026-11-01', pago_em: null },
  ];
  assert.equal(recebimentoVencido(lancamentos, HOJE), 30000);
});

test('sem nada vencido não existe alerta de recebimento', () => {
  const alertas = alertasDoNegocio({
    negocio: NEG, tarefas: [],
    lancamentos: [{ tipo: 'receita', valor: 90000, vencimento: '2026-12-01', pago_em: null }],
    hoje: HOJE,
  });
  assert.deepEqual(alertas, []);
});
