import test from 'node:test';
import assert from 'node:assert/strict';

import { resumoDoNegocio } from '../lib/resumo.js';

const HOJE = '2026-11-15';

const BASE = {
  etapa: 'Proposta enviada',
  valor_previsto: 186000,
  dono: { nome: 'Leo Diniz Treulieb' },
  fechamento_previsto: '2026-11-24',
  ultimoEm: '2026-11-14',
};

const achar = (linhas, rotulo) => linhas.find((l) => l.rotulo === rotulo);

test('traz etapa, dono, valor, fechamento e silêncio', () => {
  const linhas = resumoDoNegocio(BASE, HOJE);
  assert.deepEqual(linhas.map((l) => l.rotulo), ['Etapa', 'Dono', 'Valor', 'Fechamento', 'Sem mexer há']);
});

test('o valor sai em reais, sem centavos', () => {
  assert.equal(achar(resumoDoNegocio(BASE, HOJE), 'Valor').valor, 'R$ 186.000');
});

test('valor ausente avisa em vez de mostrar zero', () => {
  const l = achar(resumoDoNegocio({ ...BASE, valor_previsto: null }, HOJE), 'Valor');
  assert.equal(l.valor, 'Sem valor ainda');
  assert.equal(l.tom, 'fraco');
});

test('fechamento à vista fica em alerta, e vencido em risco', () => {
  assert.equal(achar(resumoDoNegocio(BASE, HOJE), 'Fechamento').tom, 'alerta');
  const vencido = { ...BASE, fechamento_previsto: '2026-11-02' };
  const l = achar(resumoDoNegocio(vencido, HOJE), 'Fechamento');
  assert.equal(l.tom, 'risco');
  assert.match(l.valor, /venceu/);
});

test('fechamento longe não ganha tom', () => {
  const longe = { ...BASE, fechamento_previsto: '2027-03-01' };
  assert.equal(achar(resumoDoNegocio(longe, HOJE), 'Fechamento').tom, undefined);
});

test('um projeto usa o prazo no lugar do fechamento', () => {
  const projeto = { ...BASE, etapa: 'Em andamento', prazo: '2026-12-20', fechamento_previsto: null };
  const linhas = resumoDoNegocio(projeto, HOJE, 'prazo');
  assert.equal(achar(linhas, 'Prazo').valor, '20/12/2026');
  assert.equal(achar(linhas, 'Fechamento'), undefined);
});

test('parado além do limite da etapa fica em risco', () => {
  const parado = { ...BASE, ultimoEm: '2026-10-20' };
  const l = achar(resumoDoNegocio(parado, HOJE), 'Sem mexer há');
  assert.equal(l.valor, '26 dias');
  assert.equal(l.tom, 'risco');
});

test('um dia é "1 dia", não "1 dias"', () => {
  const ontem = { ...BASE, ultimoEm: '2026-11-14' };
  assert.equal(achar(resumoDoNegocio(ontem, HOJE), 'Sem mexer há').valor, '1 dia');
});

test('sem dono e sem data, cada linha diz o que falta', () => {
  const cru = { etapa: 'Contato', valor_previsto: null, dono: null, ultimoEm: null };
  const linhas = resumoDoNegocio(cru, HOJE);
  assert.equal(achar(linhas, 'Dono').valor, 'Sem dono');
  assert.equal(achar(linhas, 'Fechamento').valor, 'Sem data');
  assert.equal(achar(linhas, 'Sem mexer há').valor, '—');
});
