import React, { useEffect, useRef, useState } from 'react';
import { motion, type Variants } from 'motion/react';
import { staggerChild, staggerParent } from './variants';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Atraso em segundos — usar só em poucos elementos por ecrã. */
  delay?: number;
  /** Anima os filhos em sequência (para grelhas e listas). */
  stagger?: boolean;
  /** Ritmo do stagger em segundos (por omissão 0.06). */
  staggerGap?: number;
}

/**
 * Observa o elemento uma única vez e devolve `true` quando entra no ecrã.
 *
 * Usamos `IntersectionObserver` próprio e não o `whileInView` do motion:
 * em páginas carregadas com `React.lazy` o `whileInView` não aplica os
 * estilos iniciais e a entrada nunca chega a jogar.
 */
export function useVezNoEcra(ref: React.RefObject<HTMLElement | null>): boolean {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visivel) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisivel(true);
      return;
    }
    const io = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisivel(true);
          io.disconnect();
        }
      },
      { rootMargin: '-60px 0px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, visivel]);

  return visivel;
}

/**
 * Entrada em scroll: o elemento aparece quando entra no ecrã (uma vez).
 * Com `prefers-reduced-motion` o MotionConfig global mantém só o fade.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  className,
  delay = 0,
  stagger = false,
  staggerGap = 0.06
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const visivel = useVezNoEcra(ref);

  if (stagger) {
    const parentVariants: Variants =
      staggerGap === 0.06
        ? staggerParent
        : {
            hidden: {},
            visible: { transition: { delayChildren: 0.05, staggerChildren: staggerGap } }
          };
    return (
      <motion.div
        ref={ref}
        className={className}
        variants={parentVariants}
        initial="hidden"
        animate={visivel ? 'visible' : 'hidden'}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={
        visivel
          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
          : { opacity: 0, y: 16, filter: 'blur(4px)' }
      }
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

/** Item dentro de um `<Reveal stagger>`. Mantém a entrada coerente com o pai. */
export const RevealItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => <motion.div className={className} variants={staggerChild}>{children}</motion.div>;
