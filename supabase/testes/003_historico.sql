-- Asserção da Task 2: duas trocas de etapa seguidas geram DOIS eventos (Review Focus 5).
do $$
declare nid uuid; n int; cod text;
begin
  insert into public.negocio (titulo, etapa) values ('teste gatilho', 'Contato') returning id, codigo into nid, cod;
  update public.negocio set etapa = 'Diagnóstico' where id = nid;
  update public.negocio set etapa = 'Negociação' where id = nid;
  select count(*) into n from public.evento where negocio_id = nid and acao = 'Etapa alterada';
  assert n = 2, n || ' eventos de etapa, esperava 2';
  select count(*) into n from public.evento where negocio_id = nid and acao = 'Negócio criado';
  assert n = 1, 'faltou o evento de criacao';
  assert cod ~ '^NEG-\d{3,}$', 'codigo fora do formato: ' || cod;
  delete from public.negocio where id = nid;
end $$;
select 'asserções 003 ok' as resultado;
