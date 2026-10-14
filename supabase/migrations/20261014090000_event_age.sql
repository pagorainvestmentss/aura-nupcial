-- Ocasião "aniversário": o cliente indica quantos anos está a fazer
-- (campo do formulário em /cliente/dados) e o convite mostra no topo
-- (ex.: "30 ANOS") e no cartão impresso. As outras ocasiões nunca o usam.

alter table public.events
  add column if not exists age integer;

alter table public.events
  drop constraint if exists events_age_check;
alter table public.events
  add constraint events_age_check
  check (age is null or (age >= 1 and age <= 130));
