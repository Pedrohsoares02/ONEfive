import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moverEtapa } from '../lib/negocios.js';

function clienteFalso({ usuario, pessoa, registro }) {
  return {
    gravou: registro,
    auth: { getUser: async () => ({ data: { user: usuario }, error: null }) },
    from() {
      return {
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: pessoa, error: null }) }) }),
        update: (valores) => {
          registro.push(valores);
          return { eq: async () => ({ error: null }) };
        },
      };
    },
  };
}

function clienteDoTime(registro) {
  return clienteFalso({
    usuario: { id: 'u1' },
    pessoa: { id: 'u1', nome: 'Ricardo', papel: 'admin', ativo: true },
    registro,
  });
}

test('moverEtapa recusa etapa fora da lista', async () => {
  const gravou = [];
  await assert.rejects(
    () => moverEtapa(clienteDoTime(gravou), 'abc', 'QualquerCoisa'),
    /Etapa inválida/
  );
  assert.equal(gravou.length, 0, 'gravou mesmo com etapa inválida');
});

test('moverEtapa sem sessão não grava nada', async () => {
  const gravou = [];
  const semSessao = clienteFalso({ usuario: null, pessoa: null, registro: gravou });
  await assert.rejects(() => moverEtapa(semSessao, 'abc', 'Negociação'), /NEXT_REDIRECT/);
  assert.equal(gravou.length, 0, 'gravou com sessão expirada');
});

test('moverEtapa de quem não é do time não grava nada', async () => {
  const gravou = [];
  const estranho = clienteFalso({ usuario: { id: 'u9' }, pessoa: null, registro: gravou });
  await assert.rejects(() => moverEtapa(estranho, 'abc', 'Negociação'), /NEXT_REDIRECT/);
  assert.equal(gravou.length, 0, 'gravou para quem não é do time');
});

test('moverEtapa grava a etapa válida', async () => {
  const gravou = [];
  const r = await moverEtapa(clienteDoTime(gravou), 'abc', 'Em andamento');
  assert.deepEqual(r, { ok: true });
  assert.equal(gravou.length, 1);
  assert.equal(gravou[0].etapa, 'Em andamento');
});
