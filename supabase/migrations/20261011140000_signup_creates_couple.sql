-- ── Fase 2 (Issue #29): registo de cliente auto-suficiente ──────────────────
-- O projecto tem `mailer_autoconfirm = false`, pelo que o `signUp` do Supabase
-- NÃO devolve sessão imediata (o utilizador tem de confirmar o email). A RPC
-- `register_client` exige sessão autenticada, por isso não pode correr de forma
-- síncrona no momento do registo.
--
-- Solução: o trigger `handle_new_user` (que corre sempre que um utilizador é
-- criado, antes da confirmação) passa a criar também o CASAL e o EVENTO em
-- branco quando os metadata trazem `aura_name`/`aura_occasion`. Assim, quando o
-- cliente confirma o email e faz login, o casal e o convite já existem.
--
-- O admin continua sem `aura_name` nos metadata → não ganha casal.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := coalesce(new.raw_user_meta_data ->> 'aura_name', new.raw_user_meta_data ->> 'display_name');
  v_phone text := new.raw_user_meta_data ->> 'aura_phone';
  v_occasion text := new.raw_user_meta_data ->> 'aura_occasion';
  v_plan text := coalesce(new.raw_user_meta_data ->> 'aura_plan', 'starter');
  v_couple_id uuid;
  v_event_id uuid;
  v_slug text;
  v_candidate text;
  v_counter int := 2;
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'cliente'),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );

  -- Só cria casal+evento quando é um registo de cliente com dados de convite.
  if v_name is not null and v_occasion is not null
     and v_occasion in ('casamento', 'noivado', 'aniversario', 'outra') then

    insert into public.couples (name, email, phone, plan, status, payment_status)
    values (v_name, new.email, v_phone, v_plan, 'active', 'pending')
    returning id into v_couple_id;

    v_slug := nullif(public.slugify(v_name), '');
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
    values (v_couple_id, v_occasion, v_slug, 'draft')
    returning id into v_event_id;

    update public.couples set active_event_id = v_event_id where id = v_couple_id;

    update public.profiles
      set couple_id = v_couple_id, display_name = v_name
    where id = new.id;
  end if;

  return new;
end;
$$;
