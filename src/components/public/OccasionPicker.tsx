import React from 'react';
import { Check } from 'lucide-react';
import { OccasionId } from '../../types/wedding';
import { OCCASION_LIST } from '../../data/occasions';

/**
 * Selector das 4 ocasiões — usado em /adquirir e /criar.
 * `selected` controla o estado visual; a navegação é responsabilidade do chamador.
 */
export const OccasionPicker: React.FC<{
  selected?: OccasionId;
  onSelect: (id: OccasionId) => void;
  compact?: boolean;
}> = ({ selected, onSelect, compact }) => {
  return (
    <div className={`grid gap-4 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
      {OCCASION_LIST.map((o) => {
        const Icon = o.icon;
        const active = selected === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onSelect(o.id)}
            className={`text-left p-5 rounded-xs border transition-colors cursor-pointer ${
              active
                ? 'border-[#5E6B56] bg-white shadow-md'
                : 'border-stone-200 bg-white/70 hover:border-stone-300 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon
                className={`w-5 h-5 ${active ? 'text-[#5E6B56]' : 'text-stone-400'}`}
              />
              {active && <Check className="w-4 h-4 text-[#5E6B56]" />}
            </div>
            <p className="font-serif text-lg text-stone-900">{o.label}</p>
            <p className="text-[11px] uppercase tracking-wider text-[#5E6B56] mt-0.5">
              {o.tagline}
            </p>
            <p className="text-xs text-stone-500 font-sans mt-2 leading-relaxed">
              {o.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};
