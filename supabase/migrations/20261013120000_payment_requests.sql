-- Issue #52 — Fase 0: pedidos de pagamento com referência e confirmação auditada.
--
-- 1. platform_settings ganha os dados bancários mostrados ao cliente
--    (IBAN, telefone MCX Express, titular) — vazios até o admin configurar.
-- 2. Nova tabela payment_requests: cada pedido tem referência única
--    (ex. AURA-8F4K), plano, tipo (inicial/upgrade), valor e estado.
--    O casal só consegue INSERT/SELECT das suas linhas — nunca UPDATE
--    (só o admin confirma/cancela).
-- 3. Trigger em couples: fecha a lacuna que permitia ao casal auto-confirmar
--    payment_status ou elevar plan directamente na base de dados
--    (o gate até aqui era só de UI). Downgrades e pedidos de upgrade
--    (pending_plan) continuam a funcionar para o casal.

-- ── 1. Definições da plataforma ──────────────────────────────────────────────

alter table public.platform_settings
  add column if not exists payment_iban text,
  add column if not exists payment_mcx_phone text,
  add column if not exists payment_holder_name text;

-- ── 2. Pedidos de pagamento ──────────────────────────────────────────────────

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  plan text not null check (plan in ('starter', 'pro', 'premium')),
  kind text not null default 'initial' check (kind in ('initial', 'upgrade')),
  amount_kz integer not null check (amount_kz >= 0),
  reference text not null unique,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  confirmed_by text,
  notes text
);

create index if not exists payment_requests_couple_idx
  on public.payment_requests (couple_id);

alter table public.payment_requests enable row level security;

-- Admin: leitura e escrita totais.
create policy "payment_requests_admin_select"
  on public.payment_requests for select
  using (public.is_admin());

create policy "payment_requests_admin_update"
  on public.payment_requests for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "payment_requests_admin_delete"
  on public.payment_requests for delete
  using (public.is_admin());

-- Casal: vê e insere os SEUS pedidos — sempre como pendentes.
-- Não existe política de UPDATE para o casal: só o admin confirma/cancela.
create policy "payment_requests_own_select"
  on public.payment_requests for select
  using (couple_id = public.current_couple_id());

create policy "payment_requests_own_insert"
  on public.payment_requests for insert
  with check (
    couple_id = public.current_couple_id()
    and status = 'pending'
    and confirmed_by is null
    and paid_at is null
  );

-- ── 3. Guarda de campos comerciais do casal ──────────────────────────────────

create or replace function public.plan_rank(p text)
returns integer
language sql
immutable
as $$
  select case p
    when 'starter' then 1
    when 'pro' then 2
    when 'premium' then 3
    else 0
  end;
$$;

create or replace function public.enforce_couples_commercial_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  -- Só a equipa confirma/cobra pagamentos.
  if new.payment_status is distinct from old.payment_status then
    raise exception 'payment_status só pode ser alterado pela equipa';
  end if;

  -- O casal pode mudar de plano apenas para um nível igual ou inferior
  -- (downgrade é imediato); upgrades passam por pending_plan + pagamento.
  if new.plan is distinct from old.plan
     and public.plan_rank(new.plan) > public.plan_rank(old.plan) then
    raise exception 'upgrade de plano exige confirmação de pagamento';
  end if;

  -- Pedidos de upgrade (pending_plan) só podem apontar para um nível superior.
  if new.pending_plan is distinct from old.pending_plan
     and new.pending_plan is not null
     and public.plan_rank(new.pending_plan) <= public.plan_rank(new.plan) then
    raise exception 'pending_plan tem de ser um upgrade';
  end if;

  return new;
end;
$$;

drop trigger if exists couples_commercial_guard on public.couples;
create trigger couples_commercial_guard
  before update on public.couples
  for each row
  execute function public.enforce_couples_commercial_guard();
