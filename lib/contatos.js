import { exigirUsuario } from './sessao.js';
import { textoLimpo } from './valores.js';

/* Pessoas de contato da organização. Ficam no cliente, e não no negócio,
   porque a pessoa continua existindo quando o negócio acaba. */

const CAMPOS = ['nome', 'cargo', 'email', 'fone', 'observacoes'];

/* Conferência frouxa de propósito: aqui o objetivo é pegar o dedo trocado
   ("mariana" sem arroba), não validar RFC. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function conferir(campo, bruto) {
  const valor = textoLimpo(bruto);
  if (campo === 'nome' && valor === null) throw new Error('O contato precisa de um nome.');
  if (campo === 'email' && valor !== null && !EMAIL.test(valor)) {
    throw new Error('E-mail inválido. Falta o arroba ou o domínio.');
  }
  return valor;
}

export async function criarContato(cliente, clienteId, dados) {
  const registro = { cliente_id: clienteId };
  CAMPOS.forEach((c) => { registro[c] = conferir(c, dados?.[c]); });

  await exigirUsuario(cliente);

  const { data, error } = await cliente
    .from('contato')
    .insert(registro)
    .select('id')
    .single();

  if (error) throw new Error('Não foi possível criar o contato.');
  return data;
}

export async function salvarCampoContato(cliente, contatoId, campo, bruto) {
  if (!CAMPOS.includes(campo)) throw new Error('Esse campo não pode ser alterado por aqui.');
  const valor = conferir(campo, bruto);

  await exigirUsuario(cliente);

  const { error } = await cliente.from('contato').update({ [campo]: valor }).eq('id', contatoId);
  if (error) throw new Error('Não foi possível gravar a alteração.');
  return { ok: true, valor };
}

export async function apagarContato(cliente, contatoId) {
  await exigirUsuario(cliente);
  const { error } = await cliente.from('contato').delete().eq('id', contatoId);
  if (error) throw new Error('Não foi possível apagar o contato.');
  return { ok: true };
}
