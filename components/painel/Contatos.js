'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation.js';

import CampoEditavel from '@/components/painel/CampoEditavel.js';
import { paraWhatsApp } from '@/lib/valores.js';
import {
  criarContatoAcao, salvarCampoContatoAcao, apagarContatoAcao,
} from '@/app/(painel)/painel/acoes.js';

/* As pessoas da organização. Em órgão público o negócio não é com a
   instituição, é com quem está na cadeira — por isso nome, cargo e as duas
   vias de contato ficam à vista, e não escondidas numa tela separada. */
export default function Contatos({ clienteId, contatos, organizacao }) {
  const [lista, definirLista] = useState(contatos);
  const [erro, definirErro] = useState(null);
  const router = useRouter();

  useEffect(() => { definirLista(contatos); }, [contatos]);

  async function criar(e) {
    e.preventDefault();
    const forma = e.currentTarget;
    const d = Object.fromEntries(new FormData(forma));
    if (!String(d.nome).trim()) return;

    const r = await criarContatoAcao(clienteId, d);
    if (r?.erro) { definirErro(r.erro); return; }
    definirErro(null);
    forma.reset();
    router.refresh();
  }

  async function apagar(c) {
    const antes = lista;
    definirLista(lista.filter((x) => x.id !== c.id));
    const r = await apagarContatoAcao(c.id);
    if (r?.erro) { definirLista(antes); definirErro(r.erro); return; }
    definirErro(null);
    router.refresh();
  }

  if (!clienteId) {
    return (
      <p className="pn-nota">
        Este negócio ainda não tem organização, então não há onde guardar os contatos.
      </p>
    );
  }

  return (
    <>
      {erro && <p className="pn-recusa pn-recusa--bloco" role="alert">{erro}</p>}

      <ul className="pn-contatos">
        {lista.map((c) => {
          const zap = paraWhatsApp(c.fone);
          return (
            <li className="pn-contato" key={c.id}>
              <span className="pn-contato__selo" aria-hidden="true">{iniciais(c.nome)}</span>

              <span className="pn-contato__corpo">
                <span className="pn-contato__nome">
                  <CampoEditavel
                    valor={c.nome} rotulo="Nome do contato"
                    aoGravar={(v) => salvarCampoContatoAcao(c.id, 'nome', v)}
                  />
                </span>
                <span className="pn-contato__cargo">
                  <CampoEditavel
                    valor={c.cargo} rotulo="Cargo" vazio="sem cargo"
                    aoGravar={(v) => salvarCampoContatoAcao(c.id, 'cargo', v)}
                  />
                </span>
              </span>

              <span className="pn-contato__via">
                <CampoEditavel
                  valor={c.email} rotulo="E-mail" vazio="sem e-mail"
                  aoGravar={(v) => salvarCampoContatoAcao(c.id, 'email', v)}
                />
              </span>

              <span className="pn-contato__via">
                <CampoEditavel
                  valor={c.fone} rotulo="Telefone" vazio="sem telefone"
                  aoGravar={(v) => salvarCampoContatoAcao(c.id, 'fone', v)}
                />
              </span>

              <span className="pn-contato__acoes">
                {c.email && (
                  <a className="pn-via" href={`mailto:${c.email}`} title={`Escrever para ${c.nome}`}>
                    <span aria-hidden="true">✉</span>
                    <span className="pn-so-leitor">Enviar e-mail</span>
                  </a>
                )}
                {zap && (
                  <a
                    className="pn-via" href={`https://wa.me/${zap}`}
                    target="_blank" rel="noopener" title={`WhatsApp de ${c.nome}`}
                  >
                    <span aria-hidden="true">✆</span>
                    <span className="pn-so-leitor">Abrir WhatsApp</span>
                  </a>
                )}
                <button
                  className="pn-apagar" type="button"
                  onClick={() => apagar(c)} aria-label={`Apagar ${c.nome}`}
                >
                  ×
                </button>
              </span>
            </li>
          );
        })}

        <li className="pn-nova">
          <form onSubmit={criar} className="pn-nova__forma">
            <input className="pn-nova__nome" name="nome" placeholder="Nome" aria-label="Nome" />
            <input className="pn-nova__cargo" name="cargo" placeholder="Cargo" aria-label="Cargo" />
            <input className="pn-nova__tit" name="email" type="email" placeholder="E-mail" aria-label="E-mail" />
            <input className="pn-nova__fone" name="fone" placeholder="(47) 99999-0000" aria-label="Telefone" />
            <button className="pn-acao pn-acao--leve" type="submit">Adicionar</button>
          </form>
        </li>
      </ul>

      <p className="pn-nota-fraca">
        Os contatos pertencem a {organizacao || 'esta organização'} — aparecem em todos os
        negócios dela, e continuam aqui quando este terminar.
      </p>
    </>
  );
}

function iniciais(nome) {
  return String(nome || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}
