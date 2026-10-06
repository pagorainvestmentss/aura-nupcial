import React from 'react';

/**
 * Barra de progresso de navegação — aparece no topo enquanto a página seguinte
 * está a carregar (chunk em lazy loading) e completa a largura ao terminar.
 * Estados: `loading` = a trabalhar, `done` = a concluir.
 */
export const NavigationProgress: React.FC<{ active: boolean }> = ({ active }) => {
  const [phase, setPhase] = React.useState<'idle' | 'loading' | 'done'>('idle');

  React.useEffect(() => {
    if (active) {
      setPhase('loading');
      return;
    }
    setPhase((current) => (current === 'loading' ? 'done' : 'idle'));
  }, [active]);

  React.useEffect(() => {
    if (phase !== 'done') return;
    const timer = window.setTimeout(() => setPhase('idle'), 320);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === 'idle') return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent pointer-events-none" aria-hidden="true">
      <div
        className={`h-full origin-left bg-[#5E6B56] nav-progress ${
          phase === 'loading' ? 'nav-progress--loading' : 'nav-progress--done'
        }`}
      />
    </div>
  );
};

/** Spinner discreto para botões em submissão e áreas que processam. */
export const Spinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`animate-spin h-4 w-4 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z" />
  </svg>
);
