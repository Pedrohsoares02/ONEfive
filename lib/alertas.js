/* O que, num projeto, pede atenção hoje.

   A tela de Projetos pergunta "qual pendência eu resolvo agora", e não "onde
   cada projeto está". Quem responde é este módulo: ele lê tarefas e
   lançamentos e devolve uma fila já ordenada.

   Nada aqui é inventado — cada alerta tem uma coluna do banco por trás.
   Módulo puro: a tela ordena no navegador, sem ida ao servidor. */

const DIA = 86400000;

const dias = (de, ate) => Math.round((new Date(ate) - new Date(de)) / DIA);
const emDias = (n) => (n === 1 ? '1 dia' : n + ' dias');
const dinheiro = (v) => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });

const aberta = (t) => t?.coluna !== 'Feito';

/** Soma das receitas que já venceram e ninguém pagou. */
export function recebimentoVencido(lancamentos = [], hoje) {
  return lancamentos.reduce(
    (total, l) =>
      l?.tipo === 'receita' && l.vencimento && l.vencimento < hoje && !l.pago_em
        ? total + Number(l.valor || 0)
        : total,
    0
  );
}

/* A ordem é a da conversa, não a do banco: primeiro o que alguém marcou como
   urgente, depois o que já estourou, depois o dinheiro, e por último o que
   está parado esperando — que incomoda, mas não é culpa de quem olha. */
const PESO = { urgente: 0, atrasada: 1, recebimento: 2, aguardando: 3, travada: 4 };

function alertaDaTarefa(tarefa, todas, hoje) {
  if (!aberta(tarefa)) return null;

  const base = { titulo: tarefa.titulo, pessoaId: tarefa.responsavel_id ?? null, tarefaId: tarefa.id };

  if (tarefa.urgente) {
    return { ...base, tipo: 'urgente', rotulo: 'Urgente', tom: 'risco', peso: PESO.urgente,
      explicacao: tarefa.prazo ? 'Prazo ' + tarefa.prazo.split('-').reverse().join('/') : 'Sem prazo' };
  }

  if (tarefa.prazo && tarefa.prazo < hoje) {
    return { ...base, tipo: 'atrasada', rotulo: 'Atrasada', tom: 'risco', peso: PESO.atrasada,
      explicacao: 'Venceu há ' + emDias(dias(tarefa.prazo, hoje)) };
  }

  if (tarefa.coluna === 'Aguardando') {
    const quem = tarefa.espera_quem?.trim();
    return { ...base, tipo: 'aguardando', rotulo: 'Aguardando', tom: 'alerta', peso: PESO.aguardando,
      explicacao: quem
        ? quem + (tarefa.espera_desde ? ' há ' + emDias(dias(tarefa.espera_desde, hoje)) : '')
        : 'Ninguém registrado' };
  }

  // trava só o que ainda não foi feito: dependência concluída não segura nada
  const presas = (tarefa.depende_de ?? [])
    .map((id) => todas.find((o) => o.id === id))
    .filter((o) => o && aberta(o));

  if (presas.length) {
    return { ...base, tipo: 'travada', rotulo: 'Travada', tom: 'alerta', peso: PESO.travada,
      explicacao: 'Espera ' + presas.map((o) => o.titulo).join(', ') };
  }

  return null;
}

/** A fila de pendências de um projeto, da mais urgente para a menos. */
export function alertasDoNegocio({ negocio, tarefas = [], lancamentos = [], hoje }) {
  const fila = tarefas
    .map((t) => alertaDaTarefa(t, tarefas, hoje))
    .filter(Boolean)
    .map((a) => ({ ...a, negocioId: negocio?.id ?? null }));

  const vencido = recebimentoVencido(lancamentos, hoje);
  if (vencido > 0) {
    fila.push({
      tipo: 'recebimento', rotulo: 'Recebimento vencido', tom: 'risco', peso: PESO.recebimento,
      titulo: 'Cobrar o que já venceu',
      // dinheiro é do dono do projeto, não de quem executa a tarefa
      pessoaId: negocio?.dono_id ?? null,
      explicacao: dinheiro(vencido) + ' vencidos e em aberto',
      tarefaId: null, negocioId: negocio?.id ?? null,
    });
  }

  return fila.sort((a, b) => a.peso - b.peso);
}
