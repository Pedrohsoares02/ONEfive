-- O papel de quem é dono do negócio junto, e não só lê.
--
-- As políticas já separam o que precisava ser separado: escrever é de quem
-- está na tabela pessoa e está ativo (e_do_time), apagar é só do admin
-- (sou_admin). Faltava o nome. Chamar o Leo e o Lucas de 'leitor' seria
-- mentira: eles cadastram, movem e lançam.
--
-- Fica registrado o que este papel NÃO muda: nenhuma política lê 'socio',
-- então sócio tem exatamente o acesso que 'leitor' já tinha — tudo menos
-- apagar. O nome é para quem for ler isto depois, inclusive eu.
--
-- Pendência conhecida, não resolvida aqui: 'leitor' continua sendo o valor
-- padrão da coluna e continua podendo escrever, apesar do nome. Hoje
-- ninguém tem esse papel. No dia em que alguém precisar de acesso só de
-- leitura, as políticas de INSERT e UPDATE precisam passar a olhar o papel.

alter table public.pessoa drop constraint pessoa_papel_check;

alter table public.pessoa
  add constraint pessoa_papel_check
  check (papel in ('admin', 'socio', 'leitor'));
