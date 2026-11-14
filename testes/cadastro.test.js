import { test } from 'node:test';
import assert from 'node:assert/strict';

import { criarNegocio, salvarCampo } from '../lib/negocios.js';

/* Banco de mentira: guarda o que foi gravado para o teste conferir. */
function bancoFalso({ usuario = { id: 'u1' }, pessoa = { id: 'u1', nome: 'Ricardo', papel: 'admin', ativo: true },
                      clientesExistentes = [] } = {}) {
  const gravou = { cliente: [], negocio: [], update: [] };
  return {
    gravou,
    auth: { getUser: async () => ({ data: { user: usuario }, error: null }) },
    from(tabela) {
      if (tabela === 'pessoa') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: pessoa, error: null }) }) }) };
      }
      if (tabela === 'cliente') {
        return {
          select: () => ({
            ilike: (_col, padrao) => ({
              maybeSingle: async () => {
                const alvo = padrao.toLowerCase();
                const achou = clientesExistentes.find((c) => c.nome.toLowerCase() === alvo);
                return { data: achou ?? null, error: null };
              },
            }),
          }),
          insert: (valores) => {
            gravou.cliente.push(valores);
            return { select: () => ({ single: async () => ({ data: { id: 'cli-novo' }, error: null }) }) };
          },
        };
      }
      return {
        insert: (valores) => {
          gravou.negocio.push(valores);
          return { select: () => ({ single: async () => ({ data: { id: 'neg-novo', codigo: 'NEG-004' }, error: null }) }) };
        },
        update: (valores) => {
          gravou.update.push(valores);
          return { eq: async () => ({ error: null }) };
        },
      };
    },
  };
}

test('criarNegocio sem sessão não grava nada', async () => {
  const b = bancoFalso({ usuario: null, pessoa: null });
  await assert.rejects(
    () => criarNegocio(b, { cliente: 'Sebrae', titulo: 'Oficina', etapa: 'Contato' }),
    /NEXT_REDIRECT/
  );
  assert.deepEqual(b.gravou.negocio, []);
  assert.deepEqual(b.gravou.cliente, []);
});

test('criarNegocio exige título e cliente', async () => {
  const b = bancoFalso();
  await assert.rejects(() => criarNegocio(b, { cliente: 'Sebrae', titulo: '  ', etapa: 'Contato' }), /título/i);
  await assert.rejects(() => criarNegocio(b, { cliente: '', titulo: 'Oficina', etapa: 'Contato' }), /cliente/i);
  assert.deepEqual(b.gravou.negocio, []);
});

test('criarNegocio recusa etapa fora do funil', async () => {
  const b = bancoFalso();
  await assert.rejects(
    () => criarNegocio(b, { cliente: 'Sebrae', titulo: 'Oficina', etapa: 'Inventada' }),
    /etapa/i
  );
  assert.deepEqual(b.gravou.negocio, []);
});

test('criarNegocio reaproveita cliente já cadastrado, sem duplicar', async () => {
  const b = bancoFalso({ clientesExistentes: [{ id: 'cli-1', nome: 'Sebrae SC' }] });
  await criarNegocio(b, { cliente: '  sebrae sc ', titulo: 'Oficina', etapa: 'Contato' });
  assert.deepEqual(b.gravou.cliente, [], 'criou cliente repetido');
  assert.equal(b.gravou.negocio[0].cliente_id, 'cli-1');
});

test('criarNegocio cria o cliente quando ele não existe', async () => {
  const b = bancoFalso();
  await criarNegocio(b, { cliente: 'Prefeitura de Joinville', titulo: 'Diagnóstico', etapa: 'Contato' });
  assert.equal(b.gravou.cliente[0].nome, 'Prefeitura de Joinville');
  assert.equal(b.gravou.negocio[0].cliente_id, 'cli-novo');
});

test('criarNegocio converte o valor digitado', async () => {
  const b = bancoFalso();
  await criarNegocio(b, { cliente: 'Sebrae', titulo: 'Oficina', etapa: 'Contato', valor: '38.000' });
  assert.equal(b.gravou.negocio[0].valor_previsto, 38000);
});

test('salvarCampo recusa campo fora da lista e não grava', async () => {
  const b = bancoFalso();
  await assert.rejects(() => salvarCampo(b, 'neg-1', 'codigo', 'NEG-999'), /não pode ser alterado/i);
  assert.deepEqual(b.gravou.update, []);
});

test('salvarCampo grava o valor já convertido', async () => {
  const b = bancoFalso();
  await salvarCampo(b, 'neg-1', 'valor_previsto', '38.000');
  assert.equal(b.gravou.update[0].valor_previsto, 38000);
});

test('salvarCampo sem sessão não grava nada', async () => {
  const b = bancoFalso({ usuario: null, pessoa: null });
  await assert.rejects(() => salvarCampo(b, 'neg-1', 'observacoes', 'oi'), /NEXT_REDIRECT/);
  assert.deepEqual(b.gravou.update, []);
});
