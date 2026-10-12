import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * O backend activo é escolhido por `VITE_DATA_BACKEND`:
 *  - `supabase` → produção (chamadas reais à base de dados)
 *  - `local`    → desenvolvimento/testes (localStorage, sem rede)
 * Quando as variáveis do Supabase não existem, o backend local é usado
 * mesmo que a flag diga o contrário (builds sem ambiente definido).
 */
export function isSupabaseBackend(): boolean {
  if (import.meta.env.VITE_DATA_BACKEND !== 'supabase') return false;
  return Boolean(url && anonKey);
}

let client: SupabaseClient | null = null;

/** Cliente Supabase partilhado. Lança erro se o backend não estiver activo. */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseBackend() || !url || !anonKey) {
    throw new Error(
      'Supabase não configurado. Defina VITE_DATA_BACKEND=supabase, VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
    );
  }
  if (!client) {
    client = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }
  return client;
}
