import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { DURATION, EASE_OUT } from './variants';
import { useVezNoEcra } from './Reveal';

interface DivisoriaBotanicaProps {
  color?: string;
  className?: string;
}

/**
 * Divisória botânica que se desenha ao entrar no ecrã: a linha corre
 * de dentro para fora, a folha e o ponto aparecem no fim e o losango
 * central assenta. Com `prefers-reduced-motion` fica só o fade.
 */
export const DivisoriaBotanica: React.FC<DivisoriaBotanicaProps> = ({
  color = '#4B5848',
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const visivel = useVezNoEcra(ref);
  const semMovimento = useReducedMotion();

  const alvo = visivel ? 'visible' : 'hidden';
  const svgStyle: React.CSSProperties = {
    transformBox: 'fill-box',
    transformOrigin: 'center'
  };

  const asa = (invertida: boolean, delay: number) => (
    <svg
      width="48"
      height="12"
      viewBox="0 0 48 12"
      fill="none"
      style={invertida ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden="true"
    >
      <motion.path
        d="M0 6 H30"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.4"
        initial={semMovimento ? { pathLength: 1 } : { pathLength: 0 }}
        animate={visivel ? { pathLength: 1 } : { pathLength: semMovimento ? 1 : 0 }}
        transition={{ duration: semMovimento ? 0 : DURATION.base + 0.1, ease: EASE_OUT, delay: semMovimento ? 0 : delay }}
      />
      <motion.path
        d="M 30 6 C 36,2 42,4 40,8 C 37,7 33,6 30,6 Z"
        fill={color}
        initial={{ opacity: 0, scale: 0.7 }}
        style={svgStyle}
        animate={visivel ? { opacity: 0.75, scale: 1 } : { opacity: 0, scale: 0.7 }}
        transition={{ duration: DURATION.base, ease: EASE_OUT, delay: delay + 0.25 }}
      />
      <motion.circle
        cx="44"
        cy="5"
        r="1.5"
        fill={color}
        initial={{ opacity: 0, scale: 0 }}
        style={svgStyle}
        animate={visivel ? { opacity: 0.9, scale: 1 } : { opacity: 0, scale: 0 }}
        transition={{ duration: 0.3, ease: EASE_OUT, delay: delay + 0.4 }}
      />
    </svg>
  );

  return (
    <div
      ref={ref}
      className={`flex items-center justify-center gap-3 select-none ${className}`}
      aria-hidden="true"
    >
      {asa(false, 0)}
      <motion.div
        className="w-1.5 h-1.5 rotate-45 border"
        style={{ borderColor: color }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={visivel ? { opacity: 0.7, scale: 1 } : { opacity: 0, scale: 0.4 }}
        transition={{ duration: 0.3, ease: EASE_OUT, delay: 0.15 }}
      />
      {asa(true, 0)}
    </div>
  );
};
