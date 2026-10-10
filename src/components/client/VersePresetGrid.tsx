import React from 'react';
import { Check, BookOpen } from 'lucide-react';
import { VersePreset, isPresetActive } from '../../data/versePresets';
import { WeddingEvent } from '../../types/wedding';

interface VersePresetGridProps {
  presets: VersePreset[];
  form: WeddingEvent;
  onPick: (preset: VersePreset) => void;
}

/**
 * GRELHA DE EXEMPLOS CONJUGADOS — cada cartão preenche versículo/referência
 * e mensagem final de uma só vez. Opcional: os campos manuais continuam
 * por baixo e ficam sempre editáveis.
 */
export const VersePresetGrid: React.FC<VersePresetGridProps> = ({ presets, form, onPick }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-[#5E6B56]" />
        <p className="text-[11px] uppercase tracking-[0.25em] text-stone-500 font-sans font-medium">
          Exemplos prontos
        </p>
      </div>
      <p className="text-[11px] text-stone-400 font-sans -mt-1">
        Escolha um tema — o versículo e a mensagem final enchem-se juntos. Depois pode editar à mão.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {presets.map((preset) => {
          const active = isPresetActive(form, preset);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onPick(preset)}
              aria-pressed={active}
              className={`text-left p-4 rounded-xs border transition-colors cursor-pointer ${
                active
                  ? 'border-[#5E6B56] bg-[#F4F5F1] ring-1 ring-[#5E6B56]'
                  : 'border-stone-200 bg-white hover:border-[#5E6B56] hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-[#5E6B56]">
                  {preset.theme}
                </span>
                {active && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-sans font-semibold text-[#5E6B56]">
                    <Check className="w-3.5 h-3.5" />
                    Em uso
                  </span>
                )}
              </div>
              <p className="font-serif text-sm italic text-stone-800 leading-relaxed line-clamp-3">
                “{preset.text}”
              </p>
              <p className="text-[11px] font-sans text-stone-500 mt-1">— {preset.reference}</p>
              <div className="border-t border-stone-200 my-3" />
              <p className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-stone-400 mb-1">
                Mensagem final
              </p>
              <p className="text-xs font-sans text-stone-600 leading-relaxed line-clamp-2">
                {preset.message}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
