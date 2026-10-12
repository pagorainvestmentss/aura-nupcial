-- ── Fase 2 (Issue #29): o convite público é visto por CONVIDADOS SEM SESSÃO ──
-- As políticas RLS de leitura de `events`/`guests`/`couples` são restritas a
-- admin ou ao próprio casal, pelo que o visitante anónimo não pode (nem deve)
-- ler essas tabelas em directo — especialmente `guests`, que contém os tokens
-- individuais de todos os convidados.
--
-- O acesso público passa portanto pela RPC `resolve_invitation` (segurança
-- definer, concedida a `anon`), que resolve slug + token e devolve também o
-- ESTADO DA CONTA (para o convite poder mostrar "revogado" quando o casal está
-- suspenso) sem nunca expor a lista de convidados.

create or replace function public.resolve_invitation(p_slug text, p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  ev public.events%rowtype;
  gu public.guests%rowtype;
  cp_status text;
begin
  select * into ev from public.events where slug = p_slug and status = 'active';
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  select * into gu from public.guests where token = p_token and event_id = ev.id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_token');
  end if;

  select status into cp_status from public.couples where id = ev.couple_id;

  update public.guests
  set access_count = access_count + 1, accessed_at = now()
  where id = gu.id;

  return jsonb_build_object(
    'ok', true,
    'event', to_jsonb(ev),
    'guest', to_jsonb(gu) - 'qr_scanned_by',
    'couple_status', cp_status
  );
end;
$$;

grant execute on function public.resolve_invitation(text, text) to anon, authenticated;
