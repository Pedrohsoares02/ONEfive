/* O que precisa de você hoje.

   A tela inicial não lista o que existe — isso o quadro já faz. Lista o que
   está parado, atrasado ou faltando, com o motivo escrito. Função pura: recebe
   os dados e a data, devolve as pendências. Toda regra aqui tem teste. */

import { diasParado, estaParado } from './parado.js';

const ENCERRADAS = ['Perdido', 'Encerrado', 'Concluído'];
const DIAS_DE_AVISO = 7;

// Ordem de urgência: o que custa dinheiro ou confiança vem antes do que é só
// cadastro incompleto.
const ORDEM = [
  'em-risco',
  'fechamento-vencido',
  'tarefa-atrasada',
  'parado',
  'fechamento-perto',
  'sem-contato',
  'sem-valor',
];

const dia = 86400000;
const emDias = (de, ate) => Math.round((Date.parse(ate) - Date.parse(de)) / dia);
const soData = (t) => String(t).slice(0, 10);
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

export function pendencias({ negocios = [], tarefas = [], hoje }) {
  const lista = [];
  const abertos = negocios.filter((n) => !ENCERRADAS.includes(n.etapa));
  const nome = (n) => n.cliente?.nome || 'Sem organização';

  abertos.forEach((n) => {
    if (n.etapa === 'Em risco') {
      lista.push({
        tipo: 'em-risco', negocioId: n.id, dono: n.dono?.nome ?? null,
        titulo: `${n.titulo} está em risco`,
        motivo: `${nome(n)}. A etapa foi marcada como risco e segue assim.`,
        quando: 'agora',
      });
    }

    // Um relógio só para tudo que está aberto, com prazo diferente para lead
    // e projeto. A frase muda conforme a etapa, porque cobrar uma proposta
    // sem resposta não é a mesma conversa que um projeto em silêncio.
    if (estaParado(n, hoje)) {
      const dias = diasParado(n.ultimoEm, hoje);
      lista.push({
        tipo: 'parado', negocioId: n.id, dono: n.dono?.nome ?? null,
        titulo: n.etapa === 'Proposta enviada'
          ? `Cobrar resposta da ${nome(n)}`
          : `${n.titulo} está parado`,
        motivo: `${n.etapa === 'Proposta enviada' ? n.titulo : nome(n)}. Nada registrado há ${plural(dias, 'dia', 'dias')} — nem etapa, nem tarefa, nem observação.`,
        quando: `${dias} dias`,
      });
    }

    if (n.fechamento_previsto) {
      const falta = emDias(hoje, n.fechamento_previsto);
      if (falta < 0) {
        lista.push({
          tipo: 'fechamento-vencido', negocioId: n.id, dono: n.dono?.nome ?? null,
          titulo: `${n.titulo} passou do fechamento previsto`,
          motivo: `${nome(n)}. Era para ter fechado em ${dataBr(n.fechamento_previsto)} e a etapa não mudou.`,
          quando: `${Math.abs(falta)} dias atrás`,
        });
      } else if (falta <= DIAS_DE_AVISO) {
        lista.push({
          tipo: 'fechamento-perto', negocioId: n.id, dono: n.dono?.nome ?? null,
          titulo: `Fechamento previsto: ${n.titulo}`,
          motivo: `${nome(n)}. Previsto para ${dataBr(n.fechamento_previsto)}.`,
          quando: falta === 0 ? 'hoje' : `em ${plural(falta, 'dia', 'dias')}`,
        });
      }
    }

    if (!n.contatos) {
      lista.push({
        tipo: 'sem-contato', negocioId: n.id, dono: n.dono?.nome ?? null,
        titulo: `Nenhum contato na ${nome(n)}`,
        motivo: `${n.titulo} não tem ninguém com nome, e-mail ou telefone. Sem isso o negócio depende da sua memória.`,
        quando: 'cadastrar',
      });
    }

    if (!n.valor_previsto && ehLeadAvancado(n)) {
      lista.push({
        tipo: 'sem-valor', negocioId: n.id, dono: n.dono?.nome ?? null,
        titulo: `${n.titulo} está sem valor`,
        motivo: `${nome(n)}. Já passou de Contato e não entra na conta do funil.`,
        quando: 'definir',
      });
    }
  });

  const idsAbertos = new Set(abertos.map((n) => n.id));
  tarefas.forEach((t) => {
    if (t.coluna === 'Feito' || !t.prazo) return;
    if (t.negocio_id && !idsAbertos.has(t.negocio_id)) return;
    const atraso = emDias(t.prazo, hoje);
    if (atraso <= 0) return;
    lista.push({
      tipo: 'tarefa-atrasada', negocioId: t.negocio_id,
      titulo: `Tarefa atrasada: ${t.titulo}`,
      motivo: `O prazo era ${dataBr(t.prazo)} e a tarefa segue em ${t.coluna}.`,
      quando: `${plural(atraso, 'dia', 'dias')} de atraso`,
    });
  });

  return lista.sort((a, b) => ORDEM.indexOf(a.tipo) - ORDEM.indexOf(b.tipo));
}

const LEAD_INICIAL = 'Contato';
const ETAPAS_DE_LEAD = ['Contato', 'Diagnóstico', 'Proposta enviada', 'Negociação'];
function ehLeadAvancado(n) {
  return ETAPAS_DE_LEAD.includes(n.etapa) && n.etapa !== LEAD_INICIAL;
}

function dataBr(d) {
  return String(d).slice(0, 10).split('-').reverse().join('/');
}
