import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { ColorPalette } from '../../types/wedding';

interface AudioControlProps {
  palette: ColorPalette;
}

export const AudioControl: React.FC<AudioControlProps> = ({ palette }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  // Synthesize peaceful, gentle acoustic harp/piano arpeggios in Pentatonic Warm Scale
  const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C4, D4, E4, G4, A4, C5

  const playTone = (freq: number) => {
    if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
    try {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);

      gain.gain.setValueAtTime(0.001, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.04, audioCtxRef.current.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 3.2);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 3.5);
    } catch {
      // Audio fallback silent
    }
  };

  const startMusic = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      let step = 0;
      const sequence = [0, 2, 4, 3, 1, 4, 5, 2];

      const interval = window.setInterval(() => {
        const noteIdx = sequence[step % sequence.length];
        playTone(notes[noteIdx]);
        step++;
      }, 1400);

      timerRef.current = interval;
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const stopMusic = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={toggleMusic}
        className="group flex items-center gap-2 p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer border"
        style={{
          backgroundColor: `${palette.paperBg}E6`,
          borderColor: palette.hairline,
          color: palette.accent
        }}
        title={isPlaying ? 'Pausar melodia' : 'Tocar melodia nupcial'}
        aria-label={isPlaying ? 'Pausar melodia' : 'Tocar melodia nupcial'}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span className="hidden group-hover:inline text-[10px] tracking-wider uppercase font-sans font-medium pr-1">
              Melodia
            </span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 opacity-75" />
            <span className="hidden group-hover:inline text-[10px] tracking-wider uppercase font-sans font-medium pr-1">
              Ouvir
            </span>
          </>
        )}
      </button>
    </div>
  );
};
