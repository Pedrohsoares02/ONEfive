/* Para onde mandar a pessoa depois que o Google devolve o login.
   O valor chega pela URL, então é entrada de fora: só caminho interno do
   painel passa. Aceitar qualquer coisa abriria um redirecionamento para
   site de terceiro usando o nosso endereço como isca. */
export function destinoAposLogin(valor) {
  const padrao = '/painel';
  if (typeof valor !== 'string') return padrao;
  if (!/^\/painel(\/|$)/.test(valor)) return padrao;
  // "//host" e "/\host" são lidos como outro site pelos navegadores.
  if (valor.startsWith('//') || valor.startsWith('/\\')) return padrao;
  return valor;
}
