import React from 'react';
import { WeddingEvent, ColorPalette, GuestManualItem } from '../../types/wedding';
import { BotanicalDivider } from '../common/BotanicalFlourish';
import { Heart, Clock, Sparkles, Users, Camera, Wine, Ban, Smile } from 'lucide-react';

interface GuestManualSectionProps {
  event: WeddingEvent;
  palette: ColorPalette;
}

export const GuestManualSection: React.FC<GuestManualSectionProps> = ({
  event,
  palette
}) => {
  const activeItems = event.guestManual.filter(item => item.enabled);

  // Sem dicas activas, a secção não aparece.
  if (activeItems.length === 0) return null;

  const getIcon = (iconName: GuestManualItem['iconName']) => {
    const props = { className: 'w-5 h-5', strokeWidth: 1.4 };
    switch (iconName) {
      case 'heart':
        return <Heart {...props} />;
      case 'clock':
        return <Clock {...props} />;
      case 'sparkles':
        return <Sparkles {...props} />;
      case 'users':
        return <Users {...props} />;
      case 'camera':
        return <Camera {...props} />;
      case 'wine':
        return <Wine {...props} />;
      case 'ban':
        return <Ban {...props} />;
      case 'smile':
      default:
        return <Smile {...props} />;
    }
  };

  return (
    <section
      className="relative w-full py-20 px-6 flex flex-col items-center text-center overflow-hidden"
      style={{ backgroundColor: palette.paperWarm }}
    >
      <div className="max-w-2xl mx-auto w-full">
        <p
          className="text-xs uppercase tracking-[0.3em] font-sans font-medium mb-2"
          style={{ color: palette.mutedText }}
        >
          DICAS PARA APROVEITAR AO MÁXIMO
        </p>
        <h2
          className="font-serif text-3xl sm:text-4xl font-light tracking-wide mb-3"
          style={{ color: palette.primaryText }}
        >
          Manual do Bom Convidado
        </h2>

        <p
          className="font-serif italic text-sm sm:text-base max-w-md mx-auto mb-6"
          style={{ color: palette.mutedText }}
        >
          Pequenos gestos de consideração para que o nosso dia seja repleto de harmonia
        </p>

        <BotanicalDivider color={palette.accent} className="mb-12" />

        {/* Editorial Grid of Etiquette Guidelines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
          {activeItems.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-xs flex flex-col items-center transition-all duration-300 hover:shadow-xs"
              style={{
                backgroundColor: palette.paperBg,
                border: `1px solid ${palette.hairline}`
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{
                  backgroundColor: palette.paperWarm,
                  color: palette.accent,
                  border: `1px solid ${palette.goldAccent}`
                }}
              >
                {getIcon(item.iconName)}
              </div>

              <h4
                className="font-serif text-base sm:text-lg font-medium mb-2 leading-snug"
                style={{ color: palette.primaryText }}
              >
                {item.title}
              </h4>

              <p
                className="text-xs font-sans leading-relaxed"
                style={{ color: palette.mutedText }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
