'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation.js';

import { criarNegocioAcao } from '@/app/(painel)/painel/acoes.js';

const HOJE = () => new Date().toISOString().slice(0, 10);

/* Janela de cadastro. O cliente é digitado aqui mesmo: se já existir com
   esse nome, o negócio entra nele; se não, o cliente é criado junto. */
export default function NovoNegocio({ etapas, pessoas, clientes, rotulo = 'Novo lead', abrirAoCarregar = false }) {
  const janelaRef = useRef(null);
  const formaRef = useRef(null);
  const [erro, definirErro] = useState(null);
  const [gravando, definirGravando] = useState(false);
  const router = useRouter();

  function abrir() {
    definirErro(null);
    janelaRef.current?.showModal();
  }

  // A paleta de comandos manda "?novo=1" em vez de simular um clique.
  useEffect(() => {
    if (abrirAoCarregar) abrir();
  }, [abrirAoCarregar]);

  async function enviar(e) {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(e.currentTarget));
    definirGravando(true);
    definirErro(null);

    const resposta = await criarNegocioAcao({
      cliente: dados.cliente,
      titulo: dados.titulo,
      etapa: dados.etapa,
      donoId: dados.dono || null,
      valor: dados.valor,
      dataContato: dados.contato,
    });

    definirGravando(false);
    if (resposta?.erro) { definirErro(resposta.erro); return; }

    formaRef.current?.reset();
    janelaRef.current?.close();
    router.refresh();
  }

  return (
    <>
      <button className="pn-acao pn-acao--forte" type="button" onClick={abrir}>
        {rotulo}
      </button>

      <dialog className="pn-janela" ref={janelaRef}>
        <form ref={formaRef} onSubmit={enviar}>
          <div className="pn-janela__cab">
            <p className="pn-sub">Novo negócio</p>
            <h2>Quem procurou a gente?</h2>
          </div>

          <div className="pn-janela__corpo">
            <div>
              <label className="pn-rotulo" htmlFor="nn-cliente">Cliente</label>
              <input
                className="pn-entrada" id="nn-cliente" name="cliente" list="nn-clientes"
                autoComplete="off" required placeholder="Prefeitura de Joinville"
              />
              <datalist id="nn-clientes">
                {clientes.map((c) => <option key={c.id} value={c.nome} />)}
              </datalist>
              <p className="pn-ajuda">
                Se o nome não estiver na lista, pode digitar: o cliente é criado junto.
              </p>
            </div>

            <div>
              <label className="pn-rotulo" htmlFor="nn-titulo">O que foi pedido</label>
              <input
                className="pn-entrada" id="nn-titulo" name="titulo" required
                placeholder="Trilha de cultura de inovação"
              />
            </div>

            <div className="pn-dupla">
              <div>
                <label className="pn-rotulo" htmlFor="nn-etapa">Etapa</label>
                <select className="pn-entrada" id="nn-etapa" name="etapa" defaultValue={etapas[0]}>
                  {etapas.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="pn-rotulo" htmlFor="nn-dono">Dono</label>
                <select className="pn-entrada" id="nn-dono" name="dono">
                  {pessoas.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
            </div>

            <div className="pn-dupla">
              <div>
                <label className="pn-rotulo" htmlFor="nn-valor">Valor previsto</label>
                <input className="pn-entrada" id="nn-valor" name="valor" inputMode="decimal" placeholder="38.000" />
                <p className="pn-ajuda">Pode deixar em branco e preencher depois.</p>
              </div>
              <div>
                <label className="pn-rotulo" htmlFor="nn-contato">Primeiro contato</label>
                <input className="pn-entrada" id="nn-contato" name="contato" type="date" defaultValue={HOJE()} />
              </div>
            </div>

            {erro && <p className="pn-recusa pn-recusa--bloco" role="alert">{erro}</p>}
          </div>

          <div className="pn-janela__pe">
            <button
              className="pn-acao pn-acao--leve" type="button"
              onClick={() => janelaRef.current?.close()}
            >
              Cancelar
            </button>
            <button className="pn-acao pn-acao--forte" type="submit" disabled={gravando}>
              {gravando ? 'Criando…' : 'Criar negócio'}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
