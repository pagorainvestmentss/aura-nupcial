-- Schema inicial (Fase 2, backend apenas — a app continua em localStorage).
-- Baseado em docs/ARQUITECTURA.md §9.2–9.4.
-- profiles ganha couple_id (necessário para o RLS auth.uid() → profiles → couples da §9.3).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'cliente' check (role in ('admin', 'cliente')),
  display_name text,
  couple_id uuid,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'cliente'),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  plan text not null default 'starter' check (plan in ('starter', 'pro', 'premium')),
  status text not null default 'active' check (status in ('active', 'suspended', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  pending_plan text check (pending_plan in ('starter', 'pro', 'premium')),
  password_reminder text,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_couple_id_fkey
  foreign key (couple_id) references public.couples (id) on delete set null;

create index profiles_couple_id_idx on public.profiles (couple_id);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused')),
  template_id text,
  palette_id text,
  date_iso date,
  date_display text,
  location_display text,
  verse_reference text,
  verse_text text,
  invitation_intro text,
  ceremony_title text,
  ceremony_datetime timestamptz,
  ceremony_location text,
  ceremony_address text,
  reception_title text,
  reception_datetime timestamptz,
  reception_location text,
  reception_address text,
  hero_photo text,
  intimate_photo text,
  rings_photo text,
  timeline jsonb,
  declarations jsonb,
  guest_manual jsonb,
  couple_message jsonb,
  gallery jsonb,
  rsvp_deadline date,
  allow_plus_ones boolean not null default true,
  enable_music boolean not null default false,
  enable_qr_validation boolean not null default false,
  created_at timestamptz not null default now()
);

create index events_couple_id_idx on public.events (couple_id);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  salutation_type text,
  custom_salutation text,
  relationship text,
  phone text,
  token text not null unique,
  max_guests integer not null default 1 check (max_guests >= 1),
  confirmed_guests integer not null default 0 check (confirmed_guests >= 0),
  rsvp_status text not null default 'pending' check (rsvp_status in ('pending', 'confirmed', 'declined')),
  rsvp_date timestamptz,
  rsvp_notes text,
  dietary_restrictions text,
  accessed_at timestamptz,
  access_count integer not null default 0,
  qr_status text check (qr_status in ('unused', 'used')),
  qr_scanned_at timestamptz,
  qr_scanned_by text
);

create index guests_event_id_idx on public.guests (event_id);

create table public.platform_settings (
  id integer primary key default 1 check (id = 1),
  brand_name text not null default 'Aura Nupcial',
  support_email text,
  support_phone text,
  updated_at timestamptz not null default now()
);

insert into public.platform_settings (id) values (1) on conflict do nothing;

-- ── RLS (§9.3) ────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.events enable row level security;
alter table public.guests enable row level security;
alter table public.platform_settings enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_couple_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select couple_id from public.profiles where id = auth.uid();
$$;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "couples_admin_all"
  on public.couples for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "couples_select_own"
  on public.couples for select
  using (id = public.current_couple_id());

create policy "couples_update_own"
  on public.couples for update
  using (id = public.current_couple_id())
  with check (id = public.current_couple_id());

create policy "events_admin_all"
  on public.events for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "events_select_own"
  on public.events for select
  using (couple_id = public.current_couple_id());

create policy "events_update_own"
  on public.events for update
  using (couple_id = public.current_couple_id())
  with check (couple_id = public.current_couple_id());

create policy "guests_admin_all"
  on public.guests for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "guests_couple_crud"
  on public.guests for all
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.couple_id = public.current_couple_id()
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.couple_id = public.current_couple_id()
    )
  );

create policy "platform_settings_admin_all"
  on public.platform_settings for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "platform_settings_select"
  on public.platform_settings for select
  to authenticated
  using (true);

-- ── RPCs públicas (security definer, sem sessão) (§9.4) ──────────────────────

create or replace function public.resolve_invitation(p_slug text, p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  ev public.events%rowtype;
  gu public.guests%rowtype;
begin
  select * into ev from public.events where slug = p_slug and status = 'active';
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  select * into gu from public.guests where token = p_token and event_id = ev.id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_token');
  end if;

  update public.guests
  set access_count = access_count + 1, accessed_at = now()
  where id = gu.id;

  return jsonb_build_object(
    'ok', true,
    'event', to_jsonb(ev),
    'guest', to_jsonb(gu) - 'qr_scanned_by'
  );
end;
$$;

create or replace function public.submit_rsvp(
  p_token text,
  p_status text,
  p_confirmed_guests integer default null,
  p_notes text default null,
  p_dietary text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  gu public.guests%rowtype;
  ev_status text;
begin
  if p_status not in ('confirmed', 'declined') then
    return jsonb_build_object('ok', false, 'error', 'invalid_status');
  end if;

  select * into gu from public.guests where token = p_token;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_token');
  end if;

  select e.status into ev_status from public.events e where e.id = gu.event_id;
  if ev_status <> 'active' then
    return jsonb_build_object('ok', false, 'error', 'event_closed');
  end if;

  update public.guests
  set rsvp_status = p_status,
      rsvp_date = now(),
      rsvp_notes = p_notes,
      dietary_restrictions = p_dietary,
      confirmed_guests = coalesce(p_confirmed_guests, confirmed_guests)
  where id = gu.id;

  return jsonb_build_object('ok', true, 'status', p_status);
end;
$$;

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

grant execute on function public.resolve_invitation(text, text) to anon, authenticated;
grant execute on function public.submit_rsvp(text, text, integer, text, text) to anon, authenticated;
grant execute on function public.validate_qr(text, text) to anon, authenticated;
