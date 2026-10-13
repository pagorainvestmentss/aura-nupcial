-- Issue #44: o casal não tinha política de INSERT em events/couples.
--
-- O repositório grava com UPSERT (INSERT … ON CONFLICT DO UPDATE) em
-- saveEvent/saveCouple, e o Postgres exige que a linha passe na política de
-- INSERT mesmo quando a linha já existe — sem ramo de dono, todo o guardado
-- do cliente autenticado devolvia 403 (verificado em produção, /cliente/dados).
--
-- Passa a permitir o dono com a MESMA expressão já usada no SELECT/UPDATE:
-- admin OU casal dono da linha. A criação inicial (registo, trigger) continua
-- a correr em SECURITY DEFINER e não é afectada.
drop policy if exists "events_admin_insert" on public.events;
create policy "events_admin_or_own_insert"
  on public.events for insert
  with check (public.is_admin() OR couple_id = public.current_couple_id());

drop policy if exists "couples_admin_insert" on public.couples;
create policy "couples_admin_or_own_insert"
  on public.couples for insert
  with check (public.is_admin() OR id = public.current_couple_id());
