/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Credenciais de admin da plataforma (necessárias em produção; em DEV há conta de cortesia). */
  readonly VITE_ADMIN_EMAIL?: string;
  readonly VITE_ADMIN_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
