/* Contas da tela de tarefas. Módulo puro: a tela lê, e por isso nada de
   sessão nem de banco aqui (ver AGENTS.md). */

const GUARDADA = 'Para depois';

/* O que ainda segura esta tarefa: as dependências que não estão em Feito.
   É o que explica, no próprio cartão, por que aquilo não anda. */
export function travasDe(tarefa, todas) {
  const porId = new Map(todas.map((t) => [t.id, t]));
  return (tarefa?.depende_de ?? [])
    .map((id) => porId.get(id))
    .filter((d) => d && d.coluna !== 'Feito');
}

/* "Para depois" fica fora da conta do realizado: é o que o projeto decidiu
   não fazer agora, e contar isso como pendência afunda o percentual de um
   projeto que está em dia. Mesma regra do painel da DIP. */
export function resumoDasTarefas(tarefas) {
  const lista = tarefas ?? [];
  const consideradas = lista.filter((t) => t.coluna !== GUARDADA);
  const feitas = consideradas.filter((t) => t.coluna === 'Feito').length;

  return {
    consideradas: consideradas.length,
    feitas,
    guardadas: lista.length - consideradas.length,
    percentual: consideradas.length ? Math.round((feitas / consideradas.length) * 100) : null,
    fazendo: lista.filter((t) => t.coluna === 'Fazendo').length,
    esperando: lista.filter((t) => t.coluna === 'Aguardando').length,
  };
}
