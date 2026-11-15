import test from 'node:test';
import assert from 'node:assert/strict';

import { criarContato, salvarCampoContato } from '../lib/contatos.js';
import { paraWhatsApp } from '../lib/valores.js';

function bancoFalso({ usuario = { id: 'u1' }, pessoa = { id: 'u1', nome: 'Ricardo', papel: 'admin', ativo: true } } = {}) {
  const gravou = { insert: [], update: [] };
  return {
    gravou,
    auth: { getUser: async () => ({ data: { user: usuario }, error: null }) },
    from(tabela) {
      if (tabela === 'pessoa') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: pessoa, error: null }) }) }) };
      }
      return {
        insert: (v) => {
          gravou.insert.push(v);
          return { select: () => ({ single: async () => ({ data: { id: 'c1' }, error: null }) }) };
        },
        update: (v) => { gravou.update.push(v); return { eq: async () => ({ error: null }) }; },
      };
    },
  };
}

test('telefone brasileiro vira link de WhatsApp', () => {
  assert.equal(paraWhatsApp('(47) 99812-4410'), '5547998124410');
  assert.equal(paraWhatsApp('47998124410'), '5547998124410');
  assert.equal(paraWhatsApp('+55 47 99812-4410'), '5547998124410');
  assert.equal(paraWhatsApp('5547998124410'), '5547998124410');
});

test('telefone curto demais ou vazio não vira link', () => {
  assert.equal(paraWhatsApp(''), null);
  assert.equal(paraWhatsApp(null), null);
  assert.equal(paraWhatsApp('3421-5500'), null);
  assert.equal(paraWhatsApp('não tenho'), null);
});

test('fixo com DDD vira link, sem inventar o nono dígito', () => {
  assert.equal(paraWhatsApp('(47) 3421-5500'), '554734215500');
});

test('criarContato exige nome', async () => {
  const b = bancoFalso();
  await assert.rejects(() => criarContato(b, 'cli-1', { nome: '   ' }), /nome/i);
  assert.deepEqual(b.gravou.insert, []);
});

test('criarContato recusa e-mail sem formato de e-mail', async () => {
  const b = bancoFalso();
  await assert.rejects(() => criarContato(b, 'cli-1', { nome: 'Mariana', email: 'mariana' }), /e-mail/i);
  assert.deepEqual(b.gravou.insert, []);
});

test('criarContato grava o que foi preenchido e deixa o resto nulo', async () => {
  const b = bancoFalso();
  await criarContato(b, 'cli-1', { nome: '  Mariana Küster ', cargo: 'Secretária', email: '', fone: '' });
  const g = b.gravou.insert[0];
  assert.equal(g.nome, 'Mariana Küster');
  assert.equal(g.cargo, 'Secretária');
  assert.equal(g.email, null);
  assert.equal(g.fone, null);
  assert.equal(g.cliente_id, 'cli-1');
});

test('criarContato sem sessão não grava nada', async () => {
  const b = bancoFalso({ usuario: null, pessoa: null });
  await assert.rejects(() => criarContato(b, 'cli-1', { nome: 'Mariana' }), /NEXT_REDIRECT/);
  assert.deepEqual(b.gravou.insert, []);
});

test('salvarCampoContato recusa campo fora da lista', async () => {
  const b = bancoFalso();
  await assert.rejects(() => salvarCampoContato(b, 'c1', 'cliente_id', 'outro'), /não pode ser alterado/i);
  await assert.rejects(() => salvarCampoContato(b, 'c1', 'id', 'x'), /não pode ser alterado/i);
  assert.deepEqual(b.gravou.update, []);
});

test('salvarCampoContato não deixa o nome ficar vazio', async () => {
  const b = bancoFalso();
  await assert.rejects(() => salvarCampoContato(b, 'c1', 'nome', '  '), /nome/i);
  assert.deepEqual(b.gravou.update, []);
});

test('salvarCampoContato limpa o campo quando vem vazio', async () => {
  const b = bancoFalso();
  await salvarCampoContato(b, 'c1', 'fone', '');
  assert.equal(b.gravou.update[0].fone, null);
});
