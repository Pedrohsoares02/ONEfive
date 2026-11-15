'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation.js';

import { COLUNAS_TAREFA } from '@/lib/funil.js';
import { salvarTarefaAcao, apagarTarefaAcao } from '@/app/(painel)/painel/acoes.js';

/* A janela de tarefa, no padrão da página — não o prompt do navegador.
   Campos e ordem vindos do editor do painel da DIP: o que precisa ser feito,
   responsável, coluna, prazo, urgente, vem depois de, observações. */
export default function EditorTarefa({ aberta, tarefa, colunaPadrao, negocioId, pessoas, irmas, aoFechar }) {
  const janelaRef = useRef(null);
  const tituloRef = useRef(null);
  const [coluna, definirColuna] = useState(colunaPadrao ?? 'A fazer');
  const [depende, definirDepende] = useState([]);
  const [erro, definirErro] = useState(null);
  const [gravando, definirGravando] = useState(false);
  const [confirmando, definirConfirmando] = useState(false);
  const router = useRouter();

  const editando = Boolean(tarefa?.id);

  useEffect(() => {
    if (!aberta) return;
    definirColuna(tarefa?.coluna ?? colunaPadrao ?? 'A fazer');
    definirDepende(tarefa?.depende_de ?? []);
    definirErro(null);
    definirConfirmando(false);
  }, [aberta, tarefa, colunaPadrao]);

  useEffect(() => {
    const janela = janelaRef.current;
    if (!janela) return;
    if (aberta && !janela.open) {
      janela.showModal();
      setTimeout(() => tituloRef.current?.focus(), 30);
    }
    if (!aberta && janela.open) janela.close();
  }, [aberta]);

  async function enviar(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    definirGravando(true);
    definirErro(null);

    const r = await salvarTarefaAcao({
      id: tarefa?.id ?? null,
      negocioId,
      titulo: d.titulo,
      coluna: d.coluna,
      prazo: d.prazo,
      responsavelId: d.responsavel,
      urgente: d.urgente === 'on',
      observacoes: d.observacoes,
      esperaQuem: d.espera,
      // mantém o relógio quando a pessoa que segura não mudou
      esperaDesde: d.espera?.trim() && d.espera.trim() === tarefa?.espera_quem
        ? tarefa?.espera_desde
        : null,
      dependeDe: depende,
    });

    definirGravando(false);
    if (r?.erro) { definirErro(r.erro); return; }
    aoFechar();
    router.refresh();
  }

  async function apagar() {
    if (!confirmando) { definirConfirmando(true); return; }
    const r = await apagarTarefaAcao(tarefa.id);
    if (r?.erro) { definirErro(r.erro); definirConfirmando(false); return; }
    aoFechar();
    router.refresh();
  }

  const candidatas = irmas.filter((t) => t.id !== tarefa?.id && !depende.includes(t.id));

  return (
    <dialog className="ed-janela" ref={janelaRef} onClose={aoFechar}>
      <form onSubmit={enviar}>
        <h3>{editando ? 'Editar tarefa' : 'Nova tarefa'}</h3>

        <div className="ed-campos">
          <label className="ed-campo ed-inteiro">
            <span>O que precisa ser feito</span>
            <input
              ref={tituloRef} name="titulo" maxLength={200} required
              defaultValue={tarefa?.titulo ?? ''} placeholder="Ligar para a secretaria"
            />
          </label>

          <label className="ed-campo">
            <span>Responsável</span>
            <select name="responsavel" defaultValue={tarefa?.responsavel_id ?? ''}>
              <option value="">Ninguém ainda</option>
              {pessoas.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </label>

          <label className="ed-campo">
            <span>Coluna</span>
            <select name="coluna" value={coluna} onChange={(e) => definirColuna(e.target.value)}>
              {COLUNAS_TAREFA.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>

          <label className="ed-campo">
            <span>Prazo</span>
            <input name="prazo" type="date" defaultValue={tarefa?.prazo ?? ''} />
          </label>

          <label className="ed-campo ed-check">
            <input name="urgente" type="checkbox" defaultChecked={Boolean(tarefa?.urgente)} />
            <span>Urgente</span>
          </label>

          {/* o campo aparece sozinho ao escolher Aguardando: é a pergunta que
              essa coluna tem de responder */}
          {coluna === 'Aguardando' && (
            <label className="ed-campo ed-inteiro ed-espera">
              <span>Com quem está a bola?</span>
              <input
                name="espera" defaultValue={tarefa?.espera_quem ?? ''}
                placeholder="Jurídico da Prefeitura"
              />
            </label>
          )}

          <div className="ed-campo ed-inteiro">
            <span className="ed-rotulo">Vem depois de</span>
            {depende.length > 0 && (
              <ul className="ed-ligacoes">
                {depende.map((id) => {
                  const d = irmas.find((t) => t.id === id);
                  return (
                    <li key={id}>
                      {d?.titulo ?? 'tarefa removida'}
                      <button
                        type="button" aria-label={'Desligar ' + (d?.titulo ?? '')}
                        onClick={() => definirDepende(depende.filter((x) => x !== id))}
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <select
              value="" aria-label="Adicionar dependência"
              onChange={(e) => { if (e.target.value) definirDepende([...depende, e.target.value]); }}
              disabled={candidatas.length === 0}
            >
              <option value="">
                {candidatas.length ? 'Escolha uma tarefa…' : 'Nenhuma outra tarefa neste negócio'}
              </option>
              {candidatas.map((t) => <option key={t.id} value={t.id}>{t.titulo}</option>)}
            </select>
          </div>

          <label className="ed-campo ed-inteiro">
            <span>Observações</span>
            <textarea
              name="observacoes" rows={4} maxLength={2000}
              defaultValue={tarefa?.observacoes ?? ''}
              placeholder="Contexto, links, combinados…"
            />
          </label>
        </div>

        {erro && <p className="pn-recusa pn-recusa--bloco" role="alert">{erro}</p>}

        <div className="ed-acoes">
          {editando && (
            <button
              type="button" className={'pn-acao pn-acao--perigo' + (confirmando ? ' firme' : '')}
              onClick={apagar}
            >
              {confirmando ? 'Apagar mesmo' : 'Apagar'}
            </button>
          )}
          <span className="ed-espaco" />
          <button type="button" className="pn-acao pn-acao--leve" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="pn-acao pn-acao--forte" disabled={gravando}>
            {gravando ? 'Gravando…' : editando ? 'Salvar' : 'Criar tarefa'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
