'use client';

import { useEffect, useRef, useState } from 'react';

/* Um valor que vira campo quando clicado. Enter grava, Esc cancela, sair do
   campo grava. É o mesmo componente para texto, número, data, lista e texto
   longo — a ficha inteira é feita dele.

   O valor novo aparece na hora e só depois vai ao servidor. Se o servidor
   recusar, volta ao que era e mostra o motivo: ninguém fica achando que
   gravou algo que não gravou. */
export default function CampoEditavel({
  valor,
  tipo = 'texto',
  opcoes = [],
  vazio = 'Não definido',
  formato,
  rotulo,
  aoGravar,
}) {
  const [atual, definirAtual] = useState(valor ?? null);
  const [editando, definirEditando] = useState(false);
  const [erro, definirErro] = useState(null);
  const [salvo, definirSalvo] = useState(false);
  const campoRef = useRef(null);

  // o servidor pode trazer outro valor (outra pessoa alterou): acompanha
  useEffect(() => { definirAtual(valor ?? null); }, [valor]);

  useEffect(() => {
    if (!editando) return;
    const campo = campoRef.current;
    if (!campo) return;
    campo.focus();
    if (campo.select) campo.select();
  }, [editando]);

  async function fechar(gravar) {
    const campo = campoRef.current;
    const bruto = gravar && campo ? campo.value : null;
    definirEditando(false);
    if (!gravar) return;

    const anterior = atual;
    const normalizado = bruto === '' ? null : bruto;
    if (String(normalizado ?? '') === String(anterior ?? '')) return;

    definirAtual(normalizado);
    definirErro(null);

    const resposta = await aoGravar(normalizado);
    if (resposta?.erro) {
      definirAtual(anterior);
      definirErro(resposta.erro);
      return;
    }
    // o servidor devolve o valor já convertido (38.000 vira 38000)
    if (resposta?.valor !== undefined) definirAtual(resposta.valor);
    definirSalvo(true);
    setTimeout(() => definirSalvo(false), 1400);
  }

  function aoTeclar(e) {
    if (e.key === 'Escape') { e.preventDefault(); definirEditando(false); }
    if (e.key === 'Enter' && tipo !== 'longo') { e.preventDefault(); fechar(true); }
  }

  if (editando) {
    const comuns = {
      ref: campoRef,
      className: 'pn-edit__campo',
      defaultValue: atual ?? '',
      onBlur: () => fechar(true),
      onKeyDown: aoTeclar,
      'aria-label': rotulo,
    };

    if (tipo === 'lista') {
      return (
        <select {...comuns} onChange={() => fechar(true)}>
          <option value="">—</option>
          {opcoes.map((o) => (
            <option key={o.valor ?? o} value={o.valor ?? o}>{o.nome ?? o}</option>
          ))}
        </select>
      );
    }
    if (tipo === 'longo') return <textarea {...comuns} />;
    return (
      <input
        {...comuns}
        type={tipo === 'data' ? 'date' : 'text'}
        inputMode={tipo === 'numero' ? 'decimal' : undefined}
      />
    );
  }

  const texto = atual === null || atual === '' ? '' : mostrar(atual, formato, opcoes);

  return (
    <span className="pn-edit">
      <button
        type="button"
        className={'pn-edit__ver' + (texto ? '' : ' vazio')}
        onClick={() => definirEditando(true)}
        aria-label={rotulo ? rotulo + ': alterar' : 'Alterar'}
      >
        {texto || vazio}
      </button>
      {salvo && <span className="pn-salvo mostra">salvo</span>}
      {erro && <span className="pn-recusa" role="alert">{erro}</span>}
    </span>
  );
}

/* O formato chega como texto, e não como função: o componente é cliente e
   a ficha é servidor — função não atravessa essa fronteira. */
function mostrar(valor, formato, opcoes) {
  if (formato === 'moeda') {
    return 'R$ ' + Number(valor || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  }
  if (formato === 'data') return String(valor).split('-').reverse().join('/');
  const achado = opcoes.find((o) => (o.valor ?? o) === valor);
  return achado ? (achado.nome ?? achado) : valor;
}
