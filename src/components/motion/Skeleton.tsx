import React from 'react';

/**
 * Esqueletos de carregamento. Usados no `Suspense` de cada área (páginas em
 * lazy loading) e nas imagens enquanto carregam.
 * A animação de brilho vive no CSS (`.skeleton`) e desactiva-se com
 * `prefers-reduced-motion` — o esqueleto fica estático, mas continua a ler-se
 * como "a carregar".
 */
export const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style
}) => (
  <div
    aria-hidden="true"
    className={`skeleton rounded-xs ${className}`}
    style={style}
  />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = ''
}) => (
  <div className={`flex flex-col gap-2.5 ${className}`} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-3.5"
        style={{ width: i === lines - 1 ? '55%' : i === 1 ? '92%' : '100%' }}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string; lines?: number }> = ({
  className = '',
  lines = 3
}) => (
  <div
    className={`bg-white border border-stone-200 rounded-xs p-5 sm:p-6 ${className}`}
    aria-hidden="true"
  >
    <Skeleton className="h-4 w-24 mb-4" />
    <Skeleton className="h-7 w-40 mb-4" />
    <SkeletonText lines={lines} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 4,
  className = ''
}) => (
  <div className={`bg-white border border-stone-200 rounded-xs overflow-hidden ${className}`} aria-hidden="true">
    <div className="flex gap-4 px-5 py-3.5 border-b border-stone-200 bg-stone-50">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-3 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4 px-5 py-4 border-b border-stone-100 last:border-b-0">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-3.5 flex-1" style={{ opacity: 1 - r * 0.06 }} />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Esqueleto de página — mostrado enquanto o chunk da área carrega.
 * Mantém o esqueleto dentro do shell (cabeçalho/sidebar continuam visíveis).
 */
export const PageSkeleton: React.FC<{ variant?: 'public' | 'admin' | 'client' | 'invitation' }> = ({
  variant = 'public'
}) => {
  if (variant === 'invitation') {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16 sm:py-24" role="status" aria-label="A carregar convite">
        <div className="flex flex-col items-center gap-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3.5 w-72" />
          <div className="w-full mt-6 space-y-3">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
          <Skeleton className="h-28 w-full mt-4" />
          <Skeleton className="h-11 w-44 mt-2" />
        </div>
        <span className="sr-only">A carregar convite…</span>
      </div>
    );
  }

  if (variant === 'admin' || variant === 'client') {
    return (
      <div role="status" aria-label="A carregar painel">
        <Skeleton className="h-7 w-56 mb-2" />
        <Skeleton className="h-3.5 w-80 mb-7" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-4 w-40 mb-3" />
        <SkeletonTable rows={6} cols={4} />
        <span className="sr-only">A carregar painel…</span>
      </div>
    );
  }

  return (
    <div role="status" aria-label="A carregar página">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <Skeleton className="h-3 w-32 mb-5" />
        <Skeleton className="h-11 w-2/3 max-w-xl mb-5" />
        <SkeletonText lines={4} className="max-w-xl mb-9" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} lines={3} />
          ))}
        </div>
      </div>
      <span className="sr-only">A carregar página…</span>
    </div>
  );
};
