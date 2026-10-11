-- Fase 2 (Issue #27) — alinha o schema com os tipos reais da app (src/types/wedding.ts),
-- acrescenta as RPCs que faltam e cria o bucket de fotos.
-- A app continua em localStorage até ao corte (Issue B); esta migration é segura em produção.

-- ── extensões / utilitários ──────────────────────────────────────────────────
-- unaccent vive no schema extensions (não no public — advisor 0014).
alter extension if exists unaccent set schema extensions;
create extension if not exists unaccent with schema extensions;

create or replace function public.slugify(p text)
returns text
language sql
stable
set search_path = extensions, public
as $$
  select trim(both '-' from regexp_replace(lower(unaccent(coalesce(p, ''))), '[^a-z0-9]+', '-', 'g'));
$$;

-- Evita o advisor 0011 (search_path mutável) nas funções novas.
alter function public.register_client(text, text, text, text, text, text) set search_path = public;
alter function public.submit_rsvp(text, text, integer, text, text, jsonb, text) set search_path = public;
alter function public.validate_qr(text, text) set search_path = public;

-- ── events: colunas em falta + enums alinhados ───────────────────────────────
alter table public.events
  add column if not exists occasion text not null default 'casamento',
  add column if not exists bride_name text not null default '',
  add column if not exists groom_name text not null default '',
  add column if not exists conjunction text not null default '&',
  add column if not exists monogram text not null default '',
  add column if not exists parents_honoring text,
  add column if not exists ceremony_time text,
  add column if not exists reception_time text,
  add column if not exists ceremony_maps_url text,
  add column if not exists reception_maps_url text;

-- A app guarda hora como texto de display ("17h00") e a data em date_iso;
-- as colunas datetime originais nunca foram usadas — removidas.
alter table public.events
  drop column if exists ceremony_datetime,
  drop column if exists reception_datetime;

alter table public.events
  drop constraint if exists events_occasion_check;
alter table public.events
  add constraint events_occasion_check
  check (occasion in ('casamento', 'noivado', 'aniversario', 'outra'));

-- EventStatus da app: 'draft' | 'preview' | 'active' | 'suspended'
alter table public.events
  drop constraint if exists events_status_check;
alter table public.events
  add constraint events_status_check
  check (status in ('draft', 'preview', 'active', 'suspended'));

-- ── couples: active_event_id + payment_status alinhado ───────────────────────
alter table public.couples
  add column if not exists active_event_id uuid references public.events (id) on delete set null;

create index if not exists couples_active_event_id_idx on public.couples (active_event_id);

-- PaymentStatus da app: 'paid' | 'pending' | 'overdue' (mantém 'refunded' reservado)
alter table public.couples
  drop constraint if exists couples_payment_status_check;
alter table public.couples
  add constraint couples_payment_status_check
  check (payment_status in ('pending', 'paid', 'overdue', 'refunded'));

-- ── guests: companions/group + enums alinhados ───────────────────────────────
alter table public.guests
  add column if not exists companions jsonb not null default '[]'::jsonb,
  add column if not exists group_name text;

-- QrStatus da app: 'active' | 'used' | 'revoked' (default 'active')
alter table public.guests
  drop constraint if exists guests_qr_status_check;
alter table public.guests
  add constraint guests_qr_status_check
  check (qr_status is null or qr_status in ('active', 'used', 'revoked'));

alter table public.guests alter column qr_status set default 'active';

-- RsvpStatus da app acrescenta 'partially_confirmed'
alter table public.guests
  drop constraint if exists guests_rsvp_status_check;
alter table public.guests
  add constraint guests_rsvp_status_check
  check (rsvp_status in ('pending', 'confirmed', 'declined', 'partially_confirmed'));

-- ── RPC: register_client (autenticado) ───────────────────────────────────────
-- Cria casal + evento em branco + liga profiles.couple_id, atomicamente.
-- O frontend preenche o evento em branco logo a seguir com os defaults da ocasião.
create or replace function public.register_client(
  p_name text,
  p_email text,
  p_phone text,
  p_occasion text,
  p_plan text,
  p_slug_base text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_couple_id uuid;
  v_event_id uuid;
  v_slug text;
  v_candidate text;
  v_counter int := 2;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  if p_occasion not in ('casamento', 'noivado', 'aniversario', 'outra') then
    return jsonb_build_object('ok', false, 'error', 'invalid_occasion');
  end if;

  if p_plan not in ('starter', 'pro', 'premium') then
    return jsonb_build_object('ok', false, 'error', 'invalid_plan');
  end if;

  insert into public.couples (name, email, phone, plan, status, payment_status)
  values (p_name, p_email, p_phone, p_plan, 'active', 'pending')
  returning id into v_couple_id;

  v_slug := nullif(public.slugify(p_slug_base), '');
  if v_slug is null then
    v_slug := 'convite';
  end if;

  v_candidate := v_slug;
  while exists (select 1 from public.events e where e.slug = v_candidate) loop
    v_candidate := v_slug || '-' || v_counter;
    v_counter := v_counter + 1;
  end loop;
  v_slug := v_candidate;

  insert into public.events (couple_id, occasion, slug, status)
  values (v_couple_id, p_occasion, v_slug, 'draft')
  returning id into v_event_id;

  update public.couples set active_event_id = v_event_id where id = v_couple_id;

  update public.profiles
    set couple_id = v_couple_id,
        display_name = coalesce(nullif(display_name, ''), p_name)
  where id = v_uid;

  return jsonb_build_object(
    'ok', true,
    'couple_id', v_couple_id,
    'event_id', v_event_id,
    'slug', v_slug
  );
end;
$$;

grant execute on function public.register_client(text, text, text, text, text, text) to authenticated;

-- ── RPC: submit_rsvp — acrescenta acompanhantes, grupo e prazo ───────────────
-- Remove a assinatura antiga (5 parâmetros) para evitar ambiguidade de overload.
drop function if exists public.submit_rsvp(text, text, integer, text, text);

create or replace function public.submit_rsvp(
  p_token text,
  p_status text,
  p_confirmed_guests integer default null,
  p_notes text default null,
  p_dietary text default null,
  p_companions jsonb default null,
  p_group text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  gu public.guests%rowtype;
  ev public.events%rowtype;
  v_fim_do_prazo timestamptz;
begin
  if p_status not in ('confirmed', 'declined') then
    return jsonb_build_object('ok', false, 'error', 'invalid_status');
  end if;

  select * into gu from public.guests where token = p_token;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_token');
  end if;

  select * into ev from public.events e where e.id = gu.event_id;
  if ev.status <> 'active' then
    return jsonb_build_object('ok', false, 'error', 'event_closed');
  end if;

  -- Prazo: depois do fim do dia de rsvp_deadline não se aceitam respostas.
  if ev.rsvp_deadline is not null then
    v_fim_do_prazo := (ev.rsvp_deadline::date + 1)::timestamptz;
    if now() >= v_fim_do_prazo then
      return jsonb_build_object('ok', false, 'error', 'deadline_passed');
    end if;
  end if;

  if p_confirmed_guests is not null and p_confirmed_guests < 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_guests');
  end if;

  update public.guests
  set rsvp_status = p_status,
      rsvp_date = now(),
      rsvp_notes = coalesce(p_notes, ''),
      dietary_restrictions = coalesce(p_dietary, ''),
      confirmed_guests = coalesce(p_confirmed_guests, confirmed_guests),
      companions = case
        when p_status = 'confirmed' then coalesce(p_companions, '[]'::jsonb)
        else '[]'::jsonb
      end,
      group_name = coalesce(p_group, '')
  where id = gu.id;

  return jsonb_build_object('ok', true, 'status', p_status);
end;
$$;

grant execute on function public.submit_rsvp(text, text, integer, text, text, jsonb, text) to anon, authenticated;

-- ── RPC: validate_qr — suporta 'revoked' e default 'active' ──────────────────
create or replace function public.validate_qr(p_token text, p_scanned_by text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  gu public.guests%rowtype;
begin
  select * into gu from public.guests where token = p_token;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_token');
  end if;

  if gu.qr_status = 'revoked' then
    return jsonb_build_object(
      'ok', false, 'error', 'revoked',
      'guest_name', gu.name
    );
  end if;

  if gu.qr_status = 'used' then
    return jsonb_build_object(
      'ok', false, 'error', 'already_used',
      'guest_name', gu.name, 'scanned_at', gu.qr_scanned_at
    );
  end if;

  update public.guests
  set qr_status = 'used', qr_scanned_at = now(), qr_scanned_by = p_scanned_by
  where id = gu.id;

  return jsonb_build_object('ok', true, 'guest_name', gu.name);
end;
$$;

grant execute on function public.validate_qr(text, text) to anon, authenticated;

-- ── platform_settings: valores por omissão da app ────────────────────────────
update public.platform_settings
set brand_name = 'Aura Nupcial',
    support_email = 'ola@auranupcial.com',
    support_phone = '+244 923 000 000'
where id = 1;

-- ── Storage: bucket event-photos (privado) + políticas ───────────────────────
-- Estrutura de caminho: couples/<couple_id>/<event_id>/<ficheiro>
insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', false)
on conflict (id) do nothing;

-- Leitura anónima: o convite público é visto por convidados sem sessão
-- (o bucket é privado — o acesso é pela API storage com URLs assinadas).
drop policy if exists "event_photos_public_read" on storage.objects;
create policy "event_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'event-photos');

-- Escrita apenas pelo casal dono (ou admin): caminho couples/<o_seu_couple_id>/...
drop policy if exists "event_photos_owner_insert" on storage.objects;
create policy "event_photos_owner_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'event-photos'
    and (storage.foldername(name))[1] = 'couples'
    and (
      public.is_admin()
      or (storage.foldername(name))[2] = public.current_couple_id()::text
    )
  );

drop policy if exists "event_photos_owner_update" on storage.objects;
create policy "event_photos_owner_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'event-photos'
    and (
      public.is_admin()
      or (storage.foldername(name))[2] = public.current_couple_id()::text
    )
  )
  with check (
    bucket_id = 'event-photos'
    and (
      public.is_admin()
      or (storage.foldername(name))[2] = public.current_couple_id()::text
    )
  );

drop policy if exists "event_photos_owner_delete" on storage.objects;
create policy "event_photos_owner_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'event-photos'
    and (
      public.is_admin()
      or (storage.foldername(name))[2] = public.current_couple_id()::text
    )
  );

-- ── Revogações: funções internas não são RPCs públicas (advisors 0028/0029) ──
-- handle_new_user: só é invocada pelo trigger de auth.users — ninguém a chama.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- current_couple_id / is_admin: usadas dentro de políticas RLS (o authenticated
-- precisa de EXECUTE; o anon nunca consulta essas tabelas directamente).
-- Revoga também o grant a PUBLIC (senão o anon herda-o).
revoke execute on function public.current_couple_id() from public, anon;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.current_couple_id() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- register_client: exige sessão (auth.uid()) — o anon não pode sequer invocar.
revoke execute on function public.register_client(text, text, text, text, text, text) from public, anon;

-- resolve_invitation / submit_rsvp / validate_qr ficam públicas de propósito:
-- são a API dos convites (convidados sem sessão).

-- ── RLS: funde políticas permissivas duplicadas + optimiza auth.uid() ────────
-- (advisors auth_rls_initplan e multiple_permissive_policies)

-- profiles: uma política por acção, com (select auth.uid()) para não reavaliar por linha.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_update_own_or_admin" on public.profiles;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = (select auth.uid()) or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());

-- couples: funde admin_all + select_own + update_own numa política por acção.
drop policy if exists "couples_admin_all" on public.couples;
drop policy if exists "couples_select_own" on public.couples;
drop policy if exists "couples_update_own" on public.couples;

create policy "couples_admin_or_own_select"
  on public.couples for select
  using (public.is_admin() OR id = public.current_couple_id());

create policy "couples_admin_or_own_update"
  on public.couples for update
  using (public.is_admin() OR id = public.current_couple_id())
  with check (public.is_admin() OR id = public.current_couple_id());

create policy "couples_admin_insert"
  on public.couples for insert
  with check (public.is_admin());

create policy "couples_admin_delete"
  on public.couples for delete
  using (public.is_admin());

-- events
drop policy if exists "events_admin_all" on public.events;
drop policy if exists "events_select_own" on public.events;
drop policy if exists "events_update_own" on public.events;

create policy "events_admin_or_own_select"
  on public.events for select
  using (public.is_admin() OR couple_id = public.current_couple_id());

create policy "events_admin_or_own_update"
  on public.events for update
  using (public.is_admin() OR couple_id = public.current_couple_id())
  with check (public.is_admin() OR couple_id = public.current_couple_id());

create policy "events_admin_insert"
  on public.events for insert
  with check (public.is_admin());

create policy "events_admin_delete"
  on public.events for delete
  using (public.is_admin());

-- guests: funde admin_all + couple_crud numa só política ALL.
drop policy if exists "guests_admin_all" on public.guests;
drop policy if exists "guests_couple_crud" on public.guests;

create policy "guests_admin_or_couple"
  on public.guests for all
  using (
    public.is_admin()
    OR exists (
      select 1 from public.events e
      where e.id = event_id and e.couple_id = public.current_couple_id()
    )
  )
  with check (
    public.is_admin()
    OR exists (
      select 1 from public.events e
      where e.id = event_id and e.couple_id = public.current_couple_id()
    )
  );

-- platform_settings: leitura aberta ao authenticated; escrita só admin.
drop policy if exists "platform_settings_admin_all" on public.platform_settings;
drop policy if exists "platform_settings_select" on public.platform_settings;

create policy "platform_settings_select"
  on public.platform_settings for select
  to authenticated
  using (true);

create policy "platform_settings_admin_insert"
  on public.platform_settings for insert
  with check (public.is_admin());

create policy "platform_settings_admin_update"
  on public.platform_settings for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "platform_settings_admin_delete"
  on public.platform_settings for delete
  using (public.is_admin());
