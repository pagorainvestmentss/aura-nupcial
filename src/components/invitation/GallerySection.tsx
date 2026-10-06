import React, { useState } from 'react';
import { WeddingEvent, ColorPalette, GalleryPhoto } from '../../types/wedding';
import { BotanicalDivider } from '../common/BotanicalFlourish';
import { X, ZoomIn } from 'lucide-react';
import { isCoupleOccasion } from '../../data/occasions';
import { SmartImage } from '../motion/SmartImage';

interface GallerySectionProps {
  event: WeddingEvent;
  palette: ColorPalette;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  event,
  palette
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  if (!event.gallery || event.gallery.length === 0) return null;

  const isCouple = isCoupleOccasion(event.occasion);

  return (
    <section
      className="relative w-full py-24 px-6 flex flex-col items-center text-center overflow-hidden"
      style={{ backgroundColor: palette.paperBg }}
    >
      <div className="max-w-4xl mx-auto w-full">
        <p
          className="text-xs uppercase tracking-[0.3em] font-sans font-medium mb-2"
          style={{ color: palette.mutedText }}
        >
          {isCouple ? 'REGISTOS DO NOSSO AMOR' : 'MOMENTOS PARA GUARDAR'}
        </p>
        <h2
          className="font-serif text-3xl sm:text-4xl font-light tracking-wide mb-3"
          style={{ color: palette.primaryText }}
        >
          Álbum de Memórias
        </h2>

        <p
          className="font-serif italic text-sm sm:text-base max-w-md mx-auto mb-6"
          style={{ color: palette.mutedText }}
        >
          {isCouple
            ? 'Alguns dos momentos mais doces que antecederam o nosso grande sim'
            : 'Alguns dos momentos que antecederam este dia tão especial'}
        </p>

        <BotanicalDivider color={palette.accent} className="mb-12" />

        {/* Editorial Wedding Album Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Showcase Image (7 cols) */}
          {event.gallery[0] && (
            <div
              onClick={() => setSelectedPhoto(event.gallery[0])}
              className="md:col-span-7 group relative cursor-pointer overflow-hidden p-2 rounded-xs transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: palette.paperWarm,
                border: `1px solid ${palette.hairline}`
              }}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <SmartImage
                  src={event.gallery[0].url}
                  alt={event.gallery[0].caption || 'Foto do casal'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-stone-800">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>
              </div>
              {event.gallery[0].caption && (
                <p
                  className="font-serif italic text-xs text-center py-2.5"
                  style={{ color: palette.mutedText }}
                >
                  {event.gallery[0].caption}
                </p>
              )}
            </div>
          )}

          {/* Secondary Stack (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {event.gallery.slice(1).map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative cursor-pointer overflow-hidden p-2 rounded-xs transition-all duration-300 hover:shadow-md"
                style={{
                  backgroundColor: palette.paperWarm,
                  border: `1px solid ${palette.hairline}`
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SmartImage
                    src={photo.url}
                    alt={photo.caption || 'Foto do casal'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-stone-800">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                {photo.caption && (
                  <p
                    className="font-serif italic text-xs text-center py-2"
                    style={{ color: palette.mutedText }}
                  >
                    {photo.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] p-2 bg-[#FAF7F2] rounded-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 text-stone-800 flex items-center justify-center shadow-md hover:bg-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <SmartImage
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || 'Foto ampliada'}
              referrerPolicy="no-referrer"
              className="max-h-[80vh] w-auto object-contain mx-auto"
            />
            {selectedPhoto.caption && (
              <p className="font-serif italic text-sm text-center py-3 text-stone-700">
                {selectedPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
