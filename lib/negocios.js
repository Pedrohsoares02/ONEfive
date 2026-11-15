import { ETAPAS } from './funil.js';
import { exigirUsuario, ehAdmin } from './sessao.js';
import { validarCampo } from './campos.js';
import { numeroDeTexto, textoLimpo } from './valores.js';

/**
 * Move o negócio de etapa.
 *
 * A etapa é conferida aqui ANTES de tocar no banco, e de novo pelo CHECK da
 * tabela: a tela não é fronteira de confiança, qualquer requisição pode
 * chegar com o que quiser. A sessão é conferida antes da gravação, para que
 * um cookie vencido não escreva nada.
 */
export async function moverEtapa(cliente, negocioId, novaEtapa) {
  if (!ETAPAS.includes(novaEtapa)) throw new Error('Etapa inválida: ' + novaEtapa);

  await exigirUsuario(cliente);

  const { error } = await cliente
    .from('negocio')
    .update({ etapa: novaEtapa, atualizado_em: new Date().toISOString() })
    .eq('id', negocioId);

  if (error) throw new Error('Não foi possível mover o negócio.');
  return { ok: true };
}

/**
 * Cria um negócio, e o cliente junto quando ele ainda não existe.
 *
 * Não há tela separada de cadastro de cliente: o nome é digitado no mesmo
 * formulário. Procurar antes de inserir evita que "Sebrae SC" e "sebrae sc"
 * virem dois clientes diferentes — e aí os negócios ficariam espalhados.
 */
export async function criarNegocio(cliente, dados) {
  const pessoa = await exigirUsuario(cliente);

  const nomeCliente = textoLimpo(dados?.cliente);
  if (!nomeCliente) throw new Error('Diga de qual cliente é este negócio.');

  const titulo = textoLimpo(dados?.titulo);
  if (!titulo) throw new Error('O título não pode ficar vazio.');

  const etapa = dados?.etapa ?? 'Contato';
  if (!ETAPAS.includes(etapa)) throw new Error('Etapa inválida: ' + etapa);

  const clienteId = await acharOuCriarCliente(cliente, nomeCliente);

  const registro = {
    cliente_id: clienteId,
    titulo,
    etapa,
    dono_id: dados?.donoId ?? pessoa.id,
    valor_previsto: numeroDeTexto(dados?.valor),
  };

  const contato = validarCampo('data_contato', dados?.dataContato ?? '');
  if (!contato.ok) throw new Error(contato.motivo);
  registro.data_contato = contato.valor;

  const { data, error } = await cliente
    .from('negocio')
    .insert(registro)
    .select('id, codigo')
    .single();

  if (error) throw new Error('Não foi possível criar o negócio.');
  return data;
}

async function acharOuCriarCliente(cliente, nome) {
  // ilike compara sem diferenciar maiúscula de minúscula. O nome é escapado
  // porque % e _ são curingas: um cliente chamado "100% Joinville" acharia
  // qualquer outro.
  const padrao = nome.replace(/[\\%_]/g, (c) => '\\' + c);

  const { data: achado } = await cliente
    .from('cliente')
    .select('id')
    .ilike('nome', padrao)
    .maybeSingle();

  if (achado) return achado.id;

  const { data: novo, error } = await cliente
    .from('cliente')
    .insert({ nome })
    .select('id')
    .single();

  if (error) throw new Error('Não foi possível cadastrar o cliente.');
  return novo.id;
}

/**
 * Grava UM campo do negócio — é o que a ficha editável faz a cada saída
 * de campo. O nome do campo vem do navegador, então validarCampo decide o
 * que pode ser escrito e converte o valor antes de encostar no banco.
 */
export async function salvarCampo(cliente, negocioId, campo, bruto) {
  const conferido = validarCampo(campo, bruto);
  if (!conferido.ok) throw new Error(conferido.motivo);

  await exigirUsuario(cliente);

  const { error } = await cliente
    .from('negocio')
    .update({ [campo]: conferido.valor, atualizado_em: new Date().toISOString() })
    .eq('id', negocioId);

  if (error) throw new Error('Não foi possível gravar a alteração.');
  return { ok: true, valor: conferido.valor };
}

/**
 * Apaga o negócio e tudo que pende dele — tarefas, lançamentos, histórico,
 * check-ins saem junto por cascata do banco. Não tem volta.
 *
 * A regra do Postgres já restringe a admin, mas um delete barrado por RLS
 * volta SEM erro e sem linha apagada. Conferir aqui transforma esse silêncio
 * num recado: senão o cartão sumia da tela e reaparecia na recarga.
 */
export async function apagarNegocio(cliente, negocioId) {
  const pessoa = await exigirUsuario(cliente);
  if (!ehAdmin(pessoa)) throw new Error('Só quem é admin pode apagar um negócio.');

  const { error } = await cliente.from('negocio').delete().eq('id', negocioId);
  if (error) throw new Error('Não foi possível apagar o negócio.');
  return { ok: true };
}

/* Move o negócio na colina. Mora aqui, e não em lib/colina.js, porque
   escrever exige a sessão — e lib/colina.js é lido pela tela, que não pode
   arrastar código de servidor para o navegador. */
export async function moverColina(cliente, negocioId, posicao) {
  const n = Math.round(Number(posicao));
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    throw new Error('Posição na colina inválida: use de 0 a 100.');
  }

  await exigirUsuario(cliente);

  const { error } = await cliente.from('negocio').update({ colina: n }).eq('id', negocioId);
  if (error) throw new Error('Não foi possível mover na colina.');
  return { ok: true, colina: n };
}
