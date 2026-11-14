'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation.js';

import { somarPorTipo, margem, aReceber } from '@/lib/financeiro.js';
import { criarLancamentoAcao, apagarLancamentoAcao } from '@/app/(painel)/painel/acoes.js';

const real = (v) => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
const dataBr = (d) => (d ? d.split('-').reverse().join('/') : '—');

export default function Financeiro({ negocioId, lancamentos }) {
  const [lista, definirLista] = useState(lancamentos);
  const [erro, definirErro] = useState(null);
  const router = useRouter();

  /* A lista pintada na hora é local, para a tela responder sem esperar o
     servidor. Quando o servidor devolve a versão nova, ela tem de assumir:
     sem isto, o que foi criado só aparecia ao recarregar a página. */
  useEffect(() => { definirLista(lancamentos); }, [lancamentos]);

  const receita = somarPorTipo(lista, 'receita');
  const custo = somarPorTipo(lista, 'custo');
  const m = margem(lista);

  async function apagar(l) {
    const antes = lista;
    definirLista(lista.filter((x) => x.id !== l.id));
    const r = await apagarLancamentoAcao(l.id);
    if (r?.erro) { definirLista(antes); definirErro(r.erro); return; }
    definirErro(null);
    router.refresh();
  }

  async function lancar(e) {
    e.preventDefault();
    const forma = e.currentTarget;
    const d = Object.fromEntries(new FormData(forma));
    const r = await criarLancamentoAcao(negocioId, {
      tipo: d.tipo, rubrica: d.rubrica, valor: d.valor, vencimento: d.vencimento,
    });
    if (r?.erro) { definirErro(r.erro); return; }
    definirErro(null);
    forma.reset();
    router.refresh();
  }

  return (
    <>
      <div className="pn-kpis">
        <Numero valor={real(receita)} rotulo="Receita" />
        <Numero valor={real(custo)} rotulo="Custos" cor="neg" />
        <Numero valor={m === null ? '—' : m + '%'} rotulo="Margem" cor="pos" />
        <Numero valor={real(aReceber(lista))} rotulo="A receber" />
      </div>

      {erro && <p className="pn-recusa pn-recusa--bloco" role="alert">{erro}</p>}

      <ul className="pn-lanc">
        {lista.map((l) => (
          <li key={l.id}>
            <span className="pn-lanc-txt">
              <strong>{l.rubrica || l.descricao || (l.tipo === 'receita' ? 'Receita' : 'Custo')}</strong>
              <span className="pn-lanc-rub">
                {l.descricao && l.rubrica ? l.descricao : l.tipo === 'receita' ? 'Receita' : 'Custo'}
              </span>
            </span>
            <span className={'pn-lanc-val num' + (l.tipo === 'custo' ? ' saida' : '')}>
              {l.tipo === 'custo' ? '−' : ''}{real(l.valor)}
            </span>
            <span className="pn-lanc-sit num">
              {l.pago_em ? 'pago ' + dataBr(l.pago_em) : dataBr(l.vencimento)}
            </span>
            <button
              className="pn-apagar" type="button"
              onClick={() => apagar(l)} aria-label={'Apagar ' + (l.rubrica || 'lançamento')}
            >
              ×
            </button>
          </li>
        ))}

        <li className="pn-nova">
          <form onSubmit={lancar} className="pn-nova__forma">
            <select name="tipo" aria-label="Tipo">
              <option value="receita">Receita</option>
              <option value="custo">Custo</option>
            </select>
            <input className="pn-nova__tit" name="rubrica" placeholder="Rubrica. Ex: Hospedagem" aria-label="Rubrica" />
            <input className="pn-nova__val" name="valor" inputMode="decimal" placeholder="1.200" aria-label="Valor" />
            <input className="pn-nova__dt" name="vencimento" type="date" aria-label="Vencimento" />
            <button className="pn-acao pn-acao--leve" type="submit">Lançar</button>
          </form>
        </li>
      </ul>
    </>
  );
}

function Numero({ valor, rotulo, cor = '' }) {
  return (
    <div className="pn-kpi">
      <span className={'pn-kpi-n num ' + cor}>{valor}</span>
      <span className="pn-kpi-r">{rotulo}</span>
    </div>
  );
}
