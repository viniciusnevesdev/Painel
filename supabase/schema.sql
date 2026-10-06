-- Execute no SQL Editor do seu projeto Supabase.
create table if not exists public.painel_state(user_id uuid primary key references auth.users on delete cascade, revision bigint not null default 0, state jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.painel_google(id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, email text not null, refresh_token text not null, unique(user_id,email));
create table if not exists public.painel_oauth(token text primary key, user_id uuid not null references auth.users on delete cascade, expires_at timestamptz not null);
create table if not exists public.painel_push(endpoint text primary key, user_id uuid not null references auth.users on delete cascade, subscription jsonb not null);
create table if not exists public.painel_deliveries(delivery_key text primary key, user_id uuid not null references auth.users on delete cascade, status text not null default 'sending', at timestamptz not null default now());
alter table public.painel_state enable row level security;
alter table public.painel_google enable row level security;
alter table public.painel_oauth enable row level security;
alter table public.painel_push enable row level security;
alter table public.painel_deliveries enable row level security;
-- Nenhuma tabela é exposta diretamente ao frontend. A função verifica a identidade.
create or replace function public.painel_save(p_user uuid,p_revision bigint,p_state jsonb) returns bigint language plpgsql security definer set search_path=public as $$
declare r bigint;
begin
 insert into painel_state(user_id,revision,state) values(p_user,0,'{"lists":[{"id":"default","title":"Geral"}],"tasks":[],"notes":[]}') on conflict do nothing;
 select revision into r from painel_state where user_id=p_user for update;
 if r<>p_revision then raise exception 'CONFLICT'; end if;
 update painel_state set revision=r+1,state=p_state,updated_at=now() where user_id=p_user;
 return r+1;
end;$$;
revoke all on function public.painel_save(uuid,bigint,jsonb) from public,anon,authenticated;
grant execute on function public.painel_save(uuid,bigint,jsonb) to service_role;
create or replace function public.painel_claim(p_key text,p_user uuid) returns boolean language plpgsql security definer set search_path=public as $$
begin
 insert into painel_deliveries(delivery_key,user_id) values(p_key,p_user) on conflict do nothing;
 return found;
end;$$;
revoke all on function public.painel_claim(text,uuid) from public,anon,authenticated;
grant execute on function public.painel_claim(text,uuid) to service_role;
-- Cron: substitua URL_DO_PROJETO e SEGREDO_DO_AGENDADOR e execute separadamente.
-- select cron.schedule('painel-push','* * * * *',$job$
-- select net.http_post(url:='https://URL_DO_PROJETO.supabase.co/functions/v1/push',headers:='{"Content-Type":"application/json","Authorization":"Bearer SEGREDO_DO_AGENDADOR"}'::jsonb,body:='{}'::jsonb);
-- $job$);
