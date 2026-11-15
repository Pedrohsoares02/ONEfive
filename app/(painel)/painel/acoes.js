'use server';

import { revalidatePath } from 'next/cache';

import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { moverEtapa, criarNegocio, salvarCampo, apagarNegocio, moverColina } from '@/lib/negocios.js';
import {
  criarTarefa, moverTarefa, renomearTarefa, apagarTarefa,
  ligarTarefa, moverBalao, arrumarFluxo,
} from '@/lib/tarefas.js';
import { criarLancamento, apagarLancamento } from '@/lib/lancamentos.js';
import { criarContato, salvarCampoContato, apagarContato } from '@/lib/contatos.js';
import { ehRedirecionamento } from '@/lib/erros.js';

/* Toda ação volta { ok } ou { erro: <frase> }: a tela mostra a frase e
   desfaz o que tinha pintado na hora. Um redirecionamento (sessão vencida)
   não é erro de negócio e precisa subir, senão o Next não leva ao login. */
async function executar(tarefa) {
  try {
    const resultado = await tarefa(await criarClienteServidor());
    revalidatePath('/painel', 'layout');
    return { ok: true, ...(resultado ?? {}) };
  } catch (erro) {
    if (ehRedirecionamento(erro)) throw erro;
    return { erro: erro.message };
  }
}

export async function moverEtapaAcao(negocioId, novaEtapa) {
  const cliente = await criarClienteServidor();
  await moverEtapa(cliente, negocioId, novaEtapa);
  revalidatePath('/painel', 'layout');
  return { ok: true };
}

export async function criarNegocioAcao(dados) {
  return executar((c) => criarNegocio(c, dados));
}

export async function salvarCampoAcao(negocioId, campo, valor) {
  return executar((c) => salvarCampo(c, negocioId, campo, valor));
}

export async function apagarNegocioAcao(negocioId) {
  return executar((c) => apagarNegocio(c, negocioId));
}

export async function criarTarefaAcao(negocioId, dados) {
  return executar((c) => criarTarefa(c, negocioId, dados));
}

export async function moverTarefaAcao(tarefaId, coluna) {
  return executar((c) => moverTarefa(c, tarefaId, coluna));
}

export async function renomearTarefaAcao(tarefaId, titulo) {
  return executar((c) => renomearTarefa(c, tarefaId, titulo));
}

export async function apagarTarefaAcao(tarefaId) {
  return executar((c) => apagarTarefa(c, tarefaId));
}

export async function moverColinaAcao(negocioId, posicao) {
  return executar((c) => moverColina(c, negocioId, posicao));
}

export async function criarContatoAcao(clienteId, dados) {
  return executar((c) => criarContato(c, clienteId, dados));
}

export async function salvarCampoContatoAcao(contatoId, campo, valor) {
  return executar((c) => salvarCampoContato(c, contatoId, campo, valor));
}

export async function apagarContatoAcao(contatoId) {
  return executar((c) => apagarContato(c, contatoId));
}

export async function ligarTarefaAcao(tarefaId, anteriorId) {
  return executar((c) => ligarTarefa(c, tarefaId, anteriorId));
}

export async function moverBalaoAcao(tarefaId, x, y) {
  return executar((c) => moverBalao(c, tarefaId, x, y));
}

export async function arrumarFluxoAcao(ids) {
  return executar((c) => arrumarFluxo(c, ids));
}

export async function criarLancamentoAcao(negocioId, dados) {
  return executar((c) => criarLancamento(c, negocioId, dados));
}

export async function apagarLancamentoAcao(lancamentoId) {
  return executar((c) => apagarLancamento(c, lancamentoId));
}
