import test from 'node:test';
import assert from 'node:assert/strict';

import { fechaEm, recortes, filtrarNegocios } from '../lib/recortes.js';
import { previsaoPonderada, PESO_ETAPA } from '../lib/funil.js';

const HOJE = '2026-11-15';

const LEADS = [
  // parado (19 d) e fecha em 9 dias
  { id: 'a', titulo: 'Diagnóstico da Fazenda', cliente: { nome: 'Prefeitura de Itajaí' },
    etapa: 'Proposta enviada', valor_previsto: 186000, dono_id: 'leo',
    fechamento_previsto: '2026-11-24', ultimoEm: '2026-10-27' },
  // em dia, fecha longe
  { id: 'b', titulo: 'Painel de indicadores', cliente: { nome: 'Governo de SC' },
    etapa: 'Diagnóstico', valor_previsto: 410000, dono_id: 'lucas',
    fechamento_previsto: '2027-02-10', ultimoEm: '2026-11-14' },
  // sem valor e sem data, parado há 22 d
  { id: 'c', titulo: 'Formação em inovação', cliente: { nome: 'Sebrae SC' },
    etapa: 'Contato', valor_previsto: null, dono_id: 'lucas',
    fechamento_previsto: null, ultimoEm: '2026-10-24' },
];

test('fechaEm conta os dias que faltam, e fica negativo depois de vencer', () => {
  assert.equal(fechaEm(LEADS[0], HOJE), 9);
  assert.equal(fechaEm({ fechamento_previsto: '2026-11-01' }, HOJE), -14);
  assert.equal(fechaEm(LEADS[2], HOJE), null);
});

test('recortes conta e soma cada grupo', () => {
  const r = recortes({ negocios: LEADS, hoje: HOJE });
  assert.deepEqual(r.parado, { n: 2, soma: 186000 });
  assert.deepEqual(r.perto, { n: 1, soma: 186000 });
  assert.deepEqual(r.semvalor, { n: 1, soma: 0 });
});

test('um fechamento já vencido continua no grupo "fecham este mês"', () => {
  const vencido = [{ ...LEADS[1], fechamento_previsto: '2026-11-02' }];
  assert.equal(recortes({ negocios: vencido, hoje: HOJE }).perto.n, 1);
});

test('filtrarNegocios sem nada devolve a lista inteira', () => {
  assert.equal(filtrarNegocios(LEADS, { hoje: HOJE }).length, 3);
});

test('filtrarNegocios corta por recorte', () => {
  const sos = filtrarNegocios(LEADS, { recorte: 'parado', hoje: HOJE });
  assert.deepEqual(sos.map((n) => n.id), ['a', 'c']);
});

test('filtrarNegocios corta por dono', () => {
  const meus = filtrarNegocios(LEADS, { donoId: 'lucas', hoje: HOJE });
  assert.deepEqual(meus.map((n) => n.id), ['b', 'c']);
});

test('a busca olha título e organização, sem ligar para acento ou caixa', () => {
  assert.deepEqual(filtrarNegocios(LEADS, { texto: 'itajai', hoje: HOJE }).map((n) => n.id), ['a']);
  assert.deepEqual(filtrarNegocios(LEADS, { texto: 'INDICADORES', hoje: HOJE }).map((n) => n.id), ['b']);
});

test('os cortes se somam: dono e recorte ao mesmo tempo', () => {
  const r = filtrarNegocios(LEADS, { donoId: 'lucas', recorte: 'parado', hoje: HOJE });
  assert.deepEqual(r.map((n) => n.id), ['c']);
});

test('previsaoPonderada aplica o peso da etapa', () => {
  // 186.000 × 0,5 + 410.000 × 0,25 = 93.000 + 102.500
  assert.equal(previsaoPonderada(LEADS), 195500);
});

test('etapa sem peso conhecido não entra na previsão', () => {
  assert.equal(previsaoPonderada([{ etapa: 'Perdido', valor_previsto: 90000 }]), 0);
  assert.equal(PESO_ETAPA.Perdido, undefined);
});
