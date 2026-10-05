import React from 'react';

interface BotanicalCornerProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  color?: string;
}

export const BotanicalCorner: React.FC<BotanicalCornerProps> = ({
  position = 'top-left',
  className = '',
  color = '#4B5848'
}) => {
  const getTransform = () => {
    switch (position) {
      case 'top-right':
        return 'scaleX(-1)';
      case 'bottom-left':
        return 'scaleY(-1)';
      case 'bottom-right':
        return 'scale(-1, -1)';
      default:
        return 'none';
    }
  };

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-16 h-16 md:w-20 md:h-20 pointer-events-none select-none transition-opacity duration-700 ${className}`}
      style={{ transform: getTransform() }}
      aria-hidden="true"
    >
      {/* Primary curved olive branch */}
      <path
        d="M 6 6 C 24 16, 50 32, 90 94"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Leaf 1 */}
      <path
        d="M 22 18 C 28 8, 42 12, 38 24 C 34 22, 26 21, 22 18 Z"
        fill={color}
        opacity="0.65"
      />
      {/* Leaf 2 */}
      <path
        d="M 36 27 C 48 20, 56 32, 46 38 C 42 34, 38 30, 36 27 Z"
        fill={color}
        opacity="0.55"
      />
      {/* Leaf 3 */}
      <path
        d="M 48 40 C 62 36, 70 48, 58 54 C 54 48, 50 44, 48 40 Z"
        fill={color}
        opacity="0.7"
      />
      {/* Leaf 4 */}
      <path
        d="M 60 55 C 76 52, 84 66, 72 72 C 67 66, 62 60, 60 55 Z"
        fill={color}
        opacity="0.6"
      />
      {/* Leaf 5 */}
      <path
        d="M 75 74 C 92 73, 98 88, 86 92 C 81 85, 77 79, 75 74 Z"
        fill={color}
        opacity="0.65"
      />
      {/* Delicate secondary branch & small buds */}
      <path
        d="M 38 27 C 48 35, 55 42, 60 48"
        stroke={color}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="28" cy="12" r="1.5" fill={color} opacity="0.8" />
      <circle cx="48" cy="22" r="1.5" fill={color} opacity="0.8" />
      <circle cx="65" cy="40" r="1.5" fill={color} opacity="0.8" />
      <circle cx="82" cy="62" r="1.5" fill={color} opacity="0.8" />
    </svg>
  );
};

export const BotanicalDivider: React.FC<{ color?: string; className?: string }> = ({
  color = '#4B5848',
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center gap-3 select-none ${className}`} aria-hidden="true">
      <svg width="48" height="12" viewBox="0 0 48 12" fill="none">
        <path d="M0 6 H30" stroke={color} strokeWidth="0.8" opacity="0.4" />
        <path
          d="M 30 6 C 36 2, 42 4, 40 8 C 37 7, 33 6, 30 6 Z"
          fill={color}
          opacity="0.75"
        />
        <circle cx="44" cy="5" r="1.5" fill={color} opacity="0.9" />
      </svg>
      <div className="w-1.5 h-1.5 rotate-45 border" style={{ borderColor: color, opacity: 0.7 }} />
      <svg width="48" height="12" viewBox="0 0 48 12" fill="none" style={{ transform: 'scaleX(-1)' }}>
        <path d="M0 6 H30" stroke={color} strokeWidth="0.8" opacity="0.4" />
        <path
          d="M 30 6 C 36 2, 42 4, 40 8 C 37 7, 33 6, 30 6 Z"
          fill={color}
          opacity="0.75"
        />
        <circle cx="44" cy="5" r="1.5" fill={color} opacity="0.9" />
      </svg>
    </div>
  );
};

export const BotanicalWreath: React.FC<{
  children?: React.ReactNode;
  color?: string;
  className?: string;
  size?: number;
}> = ({
  children,
  color = '#4B5848',
  className = '',
  size = 140
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        {/* Left branch */}
        <path
          d="M 80 144 C 44 140, 24 112, 24 80 C 24 48, 48 24, 76 18"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Left leaves */}
        <path d="M 32 118 C 22 116, 20 106, 28 104 C 31 108, 32 114, 32 118 Z" fill={color} opacity="0.6" />
        <path d="M 24 88 C 14 84, 14 74, 22 74 C 24 78, 25 84, 24 88 Z" fill={color} opacity="0.65" />
        <path d="M 30 56 C 22 50, 26 40, 34 42 C 34 48, 32 52, 30 56 Z" fill={color} opacity="0.6" />
        <path d="M 50 32 C 44 24, 52 18, 58 24 C 56 28, 52 30, 50 32 Z" fill={color} opacity="0.7" />

        {/* Right branch */}
        <path
          d="M 80 144 C 116 140, 136 112, 136 80 C 136 48, 112 24, 84 18"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Right leaves */}
        <path d="M 128 118 C 138 116, 140 106, 132 104 C 129 108, 128 114, 128 118 Z" fill={color} opacity="0.6" />
        <path d="M 136 88 C 146 84, 146 74, 138 74 C 136 78, 135 84, 136 88 Z" fill={color} opacity="0.65" />
        <path d="M 130 56 C 138 50, 134 40, 126 42 C 126 48, 128 52, 130 56 Z" fill={color} opacity="0.6" />
        <path d="M 110 32 C 116 24, 108 18, 102 24 C 104 28, 108 30, 110 32 Z" fill={color} opacity="0.7" />

        {/* Bottom knot / tie */}
        <circle cx="80" cy="144" r="2" fill={color} opacity="0.8" />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export const WaxSealButton: React.FC<{
  monogram: string;
  onClick: () => void;
  sealColor?: string;
  pulse?: boolean;
}> = ({
  monogram,
  onClick,
  sealColor = '#536350',
  pulse = true
}) => {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-lg hover:shadow-xl ${
        pulse ? 'animate-pulse hover:animate-none' : ''
      }`}
      style={{
        backgroundColor: sealColor,
        boxShadow: `0 8px 24px -4px ${sealColor}66, inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -3px 6px rgba(0,0,0,0.35)`
      }}
      aria-label="Abrir convite oficial"
    >
      {/* Debossed seal border */}
      <div className="absolute inset-1.5 rounded-full border border-white/30 border-dashed" />
      <div className="absolute inset-2.5 rounded-full border border-black/20" />
      
      {/* Debossed Monogram Text */}
      <span
        className="font-serif text-xl tracking-widest text-[#FAF7F2] font-semibold select-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]"
      >
        {monogram.replace('&', '+')}
      </span>
    </button>
  );
};
