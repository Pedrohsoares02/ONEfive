import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exigirUsuario, ehAdmin } from '../lib/sessao.js';

// Dublê do cliente Supabase: só o que lib/sessao usa.
function clienteFalso({ usuario, pessoa }) {
  return {
    auth: {
      getUser: async () => ({ data: { user: usuario }, error: null }),
    },
    from() {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: pessoa, error: null }),
          }),
        }),
      };
    },
  };
}

test('exigirUsuario devolve a pessoa quando ela existe e está ativa', async () => {
  const cliente = clienteFalso({
    usuario: { id: 'u1', email: 'ricardo.soares030@gmail.com' },
    pessoa: { id: 'u1', nome: 'Ricardo Soares', email: 'ricardo.soares030@gmail.com', papel: 'admin', ativo: true },
  });
  const pessoa = await exigirUsuario(cliente);
  assert.equal(pessoa.nome, 'Ricardo Soares');
  assert.equal(pessoa.papel, 'admin');
});

test('exigirUsuario barra quem está autenticado mas não tem linha em pessoa', async () => {
  const cliente = clienteFalso({ usuario: { id: 'u9', email: 'estranho@exemplo.com' }, pessoa: null });
  await assert.rejects(() => exigirUsuario(cliente), /NEXT_REDIRECT/);
});

test('exigirUsuario barra quem está em pessoa mas inativo', async () => {
  const cliente = clienteFalso({
    usuario: { id: 'u2', email: 'ex@onefive.com' },
    pessoa: { id: 'u2', nome: 'Ex-sócio', email: 'ex@onefive.com', papel: 'leitor', ativo: false },
  });
  await assert.rejects(() => exigirUsuario(cliente), /NEXT_REDIRECT/);
});

test('exigirUsuario barra quem não está autenticado', async () => {
  const cliente = clienteFalso({ usuario: null, pessoa: null });
  await assert.rejects(() => exigirUsuario(cliente), /NEXT_REDIRECT/);
});

test('ehAdmin é verdadeiro só para papel admin', () => {
  assert.equal(ehAdmin({ papel: 'admin' }), true);
  assert.equal(ehAdmin({ papel: 'leitor' }), false);
  assert.equal(ehAdmin(null), false);
});
