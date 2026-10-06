import type { Variants } from 'motion/react';

/**
 * Variantes de motion partilhadas por toda a interface.
 *
 * Peso de desenho (skill design-motion-principles):
 *  · Primário Jakub Krehel — entrada = opacity + translateY + blur, spring sem bounce,
 *    saída sempre mais subtler que a entrada.
 *  · Secundário Emil Kowalski — painéis e formulários rápidos (180–240 ms), sem motion
 *    em interacções de alta frequência.
 *  · Selectivo Jhey Tompkins — expressão livre apenas na experiência do convidado.
 *
 * Só se anima `transform`, `opacity` e `filter` — nunca `width`/`height`/`top`/`left`.
 */

/** Saída rápida e suave (curva forte, nunca `ease` do sistema). */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
/** Entrada de quem sai — começa rápido, termina com calma. */
export const EASE_IN: [number, number, number, number] = [0.4, 0, 1, 1];

/** Durações por contexto. */
export const DURATION = {
  /** Emil — micro-interacções em painéis e formulários. */
  fast: 0.18,
  /** Jakub — entrada de elementos e secções. */
  base: 0.45,
  /** Jakub — saídas: subtler que a entrada. */
  exit: 0.22,
  /** Jhey — momentos expressivos (convite). */
  expressive: 0.7
} as const;

/** Entrada padrão de página. */
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DURATION.base, ease: EASE_OUT }
  },
  exit: {
    opacity: 0,
    y: -6,
    filter: 'blur(4px)',
    transition: { duration: DURATION.exit, ease: EASE_IN }
  }
};

/** Entrada de elemento em scroll (secções, cartões, linhas de tabela). */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DURATION.base, ease: EASE_OUT }
  }
};

/** Pai em stagger — os filhos usam `revealVariants`. */
export const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.05, staggerChildren: 0.06 } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } }
};

/** Item de lista (tabela, galeria, passos). */
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(3px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.38, ease: EASE_OUT }
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: DURATION.exit, ease: EASE_IN }
  }
};

/**
 * Entrada coreografada do hero — o pai revela os filhos em sequência
 * no momento do load (sem esperar por scroll).
 */
export const heroParent: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.06, staggerChildren: 0.07 } }
};

/** Cada bloco do hero (eyebrow, título, parágrafo, CTAs, imagem). */
export const heroChild: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: EASE_OUT }
  }
};

/** Palavra dentro de uma citação revelada palavra a palavra. */
export const quoteWord: Variants = {
  hidden: { opacity: 0, y: 8, filter: 'blur(3px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: EASE_OUT }
  }
};

/** Número ou detalhe que entra de lado (passos 01–06). */
export const slideChild: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: EASE_OUT, delay: 0.1 }
  }
};

/** Painel, modal ou gaveta: entra por cima, sai sem competir pela atenção. */
export const overlayVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.32, ease: EASE_OUT }
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.99,
    filter: 'blur(4px)',
    transition: { duration: 0.2, ease: EASE_IN }
  }
};

/** Fades simples para menu móvel e gavetas laterais. */
export const menuVariants: Variants = {
  hidden: { opacity: 0, y: -8, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.28, ease: EASE_OUT }
  },
  exit: {
    opacity: 0,
    y: -6,
    filter: 'blur(4px)',
    transition: { duration: 0.18, ease: EASE_IN }
  }
};
