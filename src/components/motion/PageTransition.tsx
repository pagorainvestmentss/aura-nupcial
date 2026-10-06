import React, { Suspense } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { NavigationProgress } from './NavigationProgress';
import { pageVariants } from './variants';

interface PageTransitionProps {
  children: React.ReactNode;
  /** Esqueleto mostrado enquanto o chunk da página carrega (lazy loading). */
  fallback: React.ReactNode;
}

/** Avisa, antes do pintar, que o conteúdo já está pronto — evita piscar a barra. */
const LoadSignal: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  React.useLayoutEffect(() => {
    onReady();
  }, [onReady]);
  return null;
};

/**
 * Transição de página — colocada NO LUGAR do elemento de rota (dentro do
 * `Outlet`), para que o `AnimatePresence` retenha a página anterior durante a
 * saída enquanto a seguinte carrega.
 *
 * · Saída: mais subtler que a entrada (Jakub).
 * · Entrada: dentro do `Suspense` — esqueleto primeiro, animação quando o
 *   conteúdo já está pronto.
 * · Barra de progresso no topo enquanto o chunk carrega.
 * · `prefers-reduced-motion`: só fade (MotionConfig global).
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children, fallback }) => {
  const location = useLocation();
  const lastPath = React.useRef(location.pathname);
  const [pending, setPending] = React.useState(false);
  const isFirstRender = React.useRef(true);

  // Actualizado em render: a barra sobe no mesmo paint em que a página muda.
  if (lastPath.current !== location.pathname) {
    lastPath.current = location.pathname;
    if (!pending) setPending(true);
  }

  const handleReady = React.useCallback(() => setPending(false), []);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Espera a saída terminar antes de voltar ao topo da nova página.
    const timer = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 220);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {/* Sem `initial={false}`: esse prop faz o contexto de presença suprimir
          TODAS as animações de entrada da primeira carga da SPA (hero,
          cartões, etc.) — ver Issue #13. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          className="h-full"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
          transition={{ duration: 0.22, ease: [0.4, 0, 1, 1] }}
        >
          <Suspense fallback={fallback}>
            <LoadSignal onReady={handleReady} />
            <motion.div className="h-full" variants={pageVariants} initial="hidden" animate="visible">
              {children}
            </motion.div>
          </Suspense>
        </motion.div>
      </AnimatePresence>
      <NavigationProgress active={pending} />
    </>
  );
};
