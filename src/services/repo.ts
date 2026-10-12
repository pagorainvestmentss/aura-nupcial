import type { WeddingRepository } from './repository';
import { isSupabaseBackend } from './supabase/client';
import { supabaseRepository } from './supabase/supabaseRepository';
import { localRepository } from './localRepository';

export type { WeddingRepository } from './repository';
export type { PlatformSettings, QrValidationResult, UpdateRsvpParams, UpdateRsvpResult } from './repository';

let cached: WeddingRepository | null = null;

/**
 * Repositório de dados da aplicação.
 *
 * Escolhido uma vez, no arranque, por `VITE_DATA_BACKEND`:
 *  - `supabase` → produção (base de dados real)
 *  - `local`    → desenvolvimento e testes (localStorage)
 * Toda a app chama sempre por aqui, em modo `async`.
 */
export function getRepo(): WeddingRepository {
  if (!cached) {
    cached = isSupabaseBackend() ? supabaseRepository : localRepository;
  }
  return cached;
}

/** Reinicializa (usado apenas em testes para trocar de backend). */
export function resetRepo(): void {
  cached = null;
}
