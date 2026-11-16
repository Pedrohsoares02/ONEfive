-- Convite por e-mail: quem está na lista entra no time no primeiro login.
--
-- Antes, a pessoa precisava tentar entrar, levar "sem acesso", e só então
-- alguém criava a linha dela em pessoa à mão (o id tem que ser o do
-- auth.users, que só existe depois do primeiro login).
--
-- Agora o admin registra e-mail, nome e papel em convite. Quando esse e-mail
-- entra pela primeira vez, o gatilho cria a pessoa e apaga o convite.
--
-- Cuidados:
-- - Só vale para e-mail já confirmado. Com login pelo Google, é o Google que
--   confirma. Se um dia existir cadastro por senha, ninguém ganha acesso só
--   por digitar o e-mail de um convidado.
-- - Uma falha aqui nunca bloqueia o login de ninguém: o pior caso é o convite
--   não ser aceito, e voltamos ao caminho manual.
-- - A tabela é só do admin. Quem não está convidado continua barrado.

create table public.convite (
  email text primary key,
  nome text not null,
  papel text not null default 'socio' check (papel in ('admin', 'socio', 'leitor')),
  criado_em timestamptz not null default now()
);

alter table public.convite enable row level security;

create policy convite_admin on public.convite
  for all to authenticated
  using (public.sou_admin()) with check (public.sou_admin());

revoke all on public.convite from anon;
grant select, insert, delete on public.convite to authenticated;

create function public.aceitar_convite() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.email_confirmed_at is null then
    return new;
  end if;

  insert into public.pessoa (id, nome, email, papel)
  select new.id, c.nome, new.email, c.papel
    from public.convite c
   where lower(c.email) = lower(new.email)
  on conflict do nothing;

  delete from public.convite where lower(email) = lower(new.email);
  return new;
exception when others then
  return new;
end $$;

revoke all on function public.aceitar_convite() from public, anon, authenticated;

create trigger ao_entrar_aceitar_convite
  after insert on auth.users
  for each row execute function public.aceitar_convite();
