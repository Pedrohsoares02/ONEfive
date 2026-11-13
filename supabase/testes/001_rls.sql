-- Asserções da Task 1. Roda inteiro; qualquer falha lança exceção.

-- 1. anônimo não alcança nenhuma tabela de dados.
--    Nota: o Supabase não concede SELECT a anon nestas tabelas, então a recusa
--    vem do GRANT antes mesmo da RLS. Mais forte do que "lê zero linhas".
do $$
declare faltando text;
begin
  select string_agg(t, ', ') into faltando
  from unnest(array['pessoa','cliente','negocio','tarefa','evento','checkin','financeiro']) t
  where has_table_privilege('anon', 'public.' || t, 'select');
  assert faltando is null, 'anon tem SELECT em: ' || faltando;
end $$;

-- 2. etapa fora da lista é recusada pelo CHECK, não só pela tela
do $$
begin
  begin
    insert into public.negocio (titulo, etapa) values ('teste', 'QualquerCoisa');
    assert false, 'CHECK de etapa nao barrou valor invalido';
  exception when check_violation then null;
  end;
end $$;

-- 3. sem usuário autenticado, ninguém é do time
do $$
begin
  assert public.e_do_time() = false, 'e_do_time() deu true sem auth.uid() valido';
  assert public.sou_admin() = false, 'sou_admin() deu true sem auth.uid() valido';
end $$;

-- 4. as sete tabelas existem e estão com RLS ligada
do $$
declare faltando text;
begin
  select string_agg(t, ', ') into faltando
  from unnest(array['pessoa','cliente','negocio','tarefa','evento','checkin','financeiro']) t
  where not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = t and c.relrowsecurity
  );
  assert faltando is null, 'sem tabela ou sem RLS: ' || faltando;
end $$;

-- 5. o código do negócio nasce no formato NEG-001 e é único
do $$
declare c1 text; c2 text;
begin
  insert into public.negocio (titulo) values ('codigo 1') returning codigo into c1;
  insert into public.negocio (titulo) values ('codigo 2') returning codigo into c2;
  assert c1 ~ '^NEG-\d{3,}$', 'codigo fora do formato: ' || c1;
  assert c1 <> c2, 'codigo repetiu: ' || c1;
  delete from public.negocio where codigo in (c1, c2);
end $$;

select 'asserções 001 ok' as resultado;
