/* O Next sinaliza redirect e notFound lançando um erro com `digest`. Engolir
   esse erro num try/catch cancela o redirecionamento sem avisar ninguém. */
export function ehRedirecionamento(erro) {
  return typeof erro?.digest === 'string' && erro.digest.startsWith('NEXT_REDIRECT');
}
