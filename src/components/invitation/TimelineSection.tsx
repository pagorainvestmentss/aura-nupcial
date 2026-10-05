import React from 'react';
import { WeddingEvent, ColorPalette, TimelineItem } from '../../types/wedding';
import { BotanicalDivider } from '../common/BotanicalFlourish';
import { Church, Sparkles, Wine, Utensils, Heart, Cake, Music, PartyPopper } from 'lucide-react';
import { isCoupleOccasion } from '../../data/occasions';

interface TimelineSectionProps {
  event: WeddingEvent;
  palette: ColorPalette;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  event,
  palette
}) => {
  // Sem cronograma preenchido, a secção não aparece.
  if (!event.timeline || event.timeline.length === 0) return null;

  const isCouple = isCoupleOccasion(event.occasion);

  const getIcon = (iconName: TimelineItem['iconName']) => {
    const props = { className: 'w-4 h-4', strokeWidth: 1.5 };
    switch (iconName) {
      case 'church':
        return <Church {...props} />;
      case 'rings':
        return <Sparkles {...props} />;
      case 'cheers':
        return <Wine {...props} />;
      case 'utensils':
        return <Utensils {...props} />;
      case 'heart':
        return <Heart {...props} />;
      case 'cake':
        return <Cake {...props} />;
      case 'party':
        return <PartyPopper {...props} />;
      case 'music':
      default:
        return <Music {...props} />;
    }
  };

  return (
    <section
      className="relative w-full py-20 px-6 flex flex-col items-center text-center overflow-hidden"
      style={{ backgroundColor: palette.paperWarm }}
    >
      <div className="max-w-xl mx-auto w-full">
        <p
          className="text-xs uppercase tracking-[0.3em] font-sans font-medium mb-2"
          style={{ color: palette.mutedText }}
        >
          {isCouple ? 'O ROTEIRO DOS NOSSOS PASSOS' : 'O ROTEIRO DO DIA'}
        </p>
        <h2
          className="font-serif text-3xl sm:text-4xl font-light tracking-wide mb-3"
          style={{ color: palette.primaryText }}
        >
          Cronograma do Dia
        </h2>

        <p
          className="font-serif italic text-sm sm:text-base mb-6"
          style={{ color: palette.mutedText }}
        >
          Cada instante planeado para ser vivido e celebrado
        </p>

        <BotanicalDivider color={palette.accent} className="mb-12" />

        {/* Elegant Vertical Timeline */}
        <div className="relative flex flex-col items-center">
          {/* Vertical Center Line */}
          <div
            className="absolute top-2 bottom-6 w-[1px]"
            style={{ backgroundColor: palette.hairline }}
          />

          <div className="space-y-10 w-full relative z-10">
            {event.timeline.map((item, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center justify-between w-full group"
                >
                  {/* Left Column (Desktop) */}
                  <div
                    className={`w-full sm:w-5/12 mb-2 sm:mb-0 ${
                      isEven ? 'sm:text-right' : 'sm:order-3 sm:text-left'
                    }`}
                  >
                    <span
                      className="font-serif text-2xl sm:text-3xl font-light tracking-tight block"
                      style={{ color: palette.accent }}
                    >
                      {item.time}
                    </span>
                    <h4
                      className="font-serif text-base sm:text-lg font-medium mt-0.5"
                      style={{ color: palette.primaryText }}
                    >
                      {item.title}
                    </h4>
                  </div>

                  {/* Center Node / Icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center sm:order-2 my-2 sm:my-0 shadow-xs transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: palette.paperBg,
                      border: `1px solid ${palette.goldAccent}`,
                      color: palette.accent
                    }}
                  >
                    {getIcon(item.iconName)}
                  </div>

                  {/* Right Column (Description) */}
                  <div
                    className={`w-full sm:w-5/12 ${
                      isEven ? 'sm:order-3 sm:text-left' : 'sm:text-right'
                    }`}
                  >
                    {item.description ? (
                      <p
                        className="text-xs font-sans leading-relaxed px-2 sm:px-0"
                        style={{ color: palette.mutedText }}
                      >
                        {item.description}
                      </p>
                    ) : (
                      <div className="h-4" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
