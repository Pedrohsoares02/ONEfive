/* O Fluxo: as tarefas do negócio ligadas por dependência, da esquerda para a
   direita, no estilo do editor do n8n. Trazido do painel da DIP.

   O kanban diz em que coluna a tarefa está. O fluxo diz o que trava o quê —
   que é a pergunta de quem toca o projeto. Tudo aqui é função pura: o
   desenho é consequência da dependência, não de onde alguém largou o balão. */

export const BALAO = { largura: 210, altura: 88, folgaX: 70, folgaY: 26, margem: 30, inicio: 120 };

const dependencias = (t) => (Array.isArray(t.depende_de) ? t.depende_de : []);

/* Quem aparece no desenho. Havendo qualquer ligação no projeto, uma tarefa
   solta só entra se alguém a posicionou à mão — senão o fluxo vira uma
   parede de balões sem fio nenhum. Sem ligação alguma, entram todas, menos
   as de "Para depois", que ainda não são deste projeto. */
export function tarefasDoFluxo(tarefas) {
  const porId = new Map(tarefas.map((t) => [t.id, t]));
  const temLigacao = tarefas.some((t) => dependencias(t).some((id) => porId.has(id)));
  const seguintes = (t) => tarefas.some((x) => dependencias(x).includes(t.id));

  return tarefas.filter((t) => {
    const ligada = dependencias(t).some((id) => porId.has(id)) || seguintes(t);
    if (ligada) return true;
    if (t.posicao_x !== null && t.posicao_x !== undefined) return true;
    return !temLigacao && t.coluna !== 'Para depois';
  });
}

/* Nível = 1 + o maior nível das anteriores. É o que põe a tarefa na coluna
   certa sem ninguém arrastar: manda a dependência, não a ordem de criação.
   A guarda contra ciclo existe porque o banco aceita A→B→C→A, e sem ela a
   recursão derrubaria a página inteira. */
export function niveisPorDependencia(tarefas) {
  const porId = new Map(tarefas.map((t) => [t.id, t]));
  const nivel = new Map();

  function calcular(t, visitando) {
    if (nivel.has(t.id)) return nivel.get(t.id);
    if (visitando.has(t.id)) return 1;
    visitando.add(t.id);

    const antes = dependencias(t).map((id) => porId.get(id)).filter(Boolean);
    const n = antes.length ? 1 + Math.max(...antes.map((a) => calcular(a, visitando))) : 1;

    visitando.delete(t.id);
    nivel.set(t.id, n);
    return n;
  }

  tarefas.forEach((t) => calcular(t, new Set()));
  return nivel;
}

/* Onde cada balão fica. Quem foi arrastado guarda a posição e ela vence;
   o resto é calculado. Dentro da coluna, cada tarefa busca a altura média de
   quem vem antes dela, para os fios cruzarem menos. */
export function arranjar(tarefas) {
  const nivel = niveisPorDependencia(tarefas);
  const maximo = tarefas.length ? Math.max(...tarefas.map((t) => nivel.get(t.id))) : 0;

  const colunas = Array.from({ length: maximo }, () => []);
  tarefas.forEach((t) => colunas[nivel.get(t.id) - 1].push(t));

  const linha = new Map();
  colunas.forEach((coluna) => {
    const peso = (t) => {
      const antes = dependencias(t).filter((id) => linha.has(id));
      if (!antes.length) return -1;
      return antes.reduce((s, id) => s + linha.get(id), 0) / antes.length;
    };
    coluna.sort((a, b) => peso(a) - peso(b));
    coluna.forEach((t, i) => linha.set(t.id, i - (coluna.length - 1) / 2));
  });

  const maiorColuna = Math.max(1, ...colunas.map((c) => c.length));
  const alturaTotal = maiorColuna * BALAO.altura + (maiorColuna - 1) * BALAO.folgaY;
  const meio = BALAO.margem + alturaTotal / 2;
  const x = (n) => BALAO.margem + BALAO.inicio + BALAO.folgaX + (n - 1) * (BALAO.largura + BALAO.folgaX);

  const posicao = new Map();
  colunas.forEach((coluna, i) => {
    const altura = coluna.length * BALAO.altura + (coluna.length - 1) * BALAO.folgaY;
    coluna.forEach((t, j) => {
      posicao.set(t.id, t.posicao_x !== null && t.posicao_x !== undefined
        ? { x: t.posicao_x, y: t.posicao_y ?? 0 }
        : { x: x(i + 1), y: meio - altura / 2 + j * (BALAO.altura + BALAO.folgaY) });
    });
  });

  posicao.meio = meio;
  return posicao;
}
