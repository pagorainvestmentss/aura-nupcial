import React, { useState } from 'react';
import { WeddingEvent, Guest } from '../../types/wedding';
import { COLOR_PALETTES } from '../../data/palettes';
import { EnvelopeOpening } from './EnvelopeOpening';
import { SaveTheDateSection } from './SaveTheDateSection';
import { CoupleHeroSection } from './CoupleHeroSection';
import { FormalInvitationSection } from './FormalInvitationSection';
import { LocationsSection } from './LocationsSection';
import { TimelineSection } from './TimelineSection';
import { DeclarationsSection } from './DeclarationsSection';
import { GuestManualSection } from './GuestManualSection';
import { GallerySection } from './GallerySection';
import { CoupleMessageSection } from './CoupleMessageSection';
import { RsvpSection } from './RsvpSection';
import { FinalCtaAndQrSection } from './FinalCtaAndQrSection';
import { AudioControl } from './AudioControl';

interface InvitationExperienceProps {
  event: WeddingEvent;
  guest?: Guest;
  onGuestUpdate?: (updatedGuest: Guest) => void;
  showEnvelopeInitial?: boolean;
}

export const InvitationExperience: React.FC<InvitationExperienceProps> = ({
  event,
  guest,
  onGuestUpdate,
  showEnvelopeInitial = true
}) => {
  const [envelopeOpen, setEnvelopeOpen] = useState(!showEnvelopeInitial);
  const [currentGuest, setCurrentGuest] = useState<Guest | undefined>(guest);

  const palette = COLOR_PALETTES[event.paletteId] || COLOR_PALETTES.sage;

  const scrollToRsvp = () => {
    const el = document.getElementById('rsvp-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGuestRsvpUpdated = (updated: Guest) => {
    setCurrentGuest(updated);
    if (onGuestUpdate) {
      onGuestUpdate(updated);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col items-center selection:bg-[#D8DFD5] selection:text-stone-900"
      style={{
        backgroundColor: palette.paperBg
      }}
    >
      {/* Envelope Opening Ceremony */}
      {!envelopeOpen && (
        <EnvelopeOpening
          event={event}
          guest={currentGuest}
          palette={palette}
          onOpenComplete={() => setEnvelopeOpen(true)}
        />
      )}

      {/* Main Wedding Invitation Document Container */}
      <main className="w-full max-w-2xl mx-auto shadow-2xl relative bg-[#FAF7F2] transition-opacity duration-700">
        {/* Save The Date Hero */}
        <SaveTheDateSection
          event={event}
          palette={palette}
          onRsvpClick={scrollToRsvp}
        />

        {/* Monogram, Sacred Verse & Arch Portrait */}
        <CoupleHeroSection
          event={event}
          palette={palette}
        />

        {/* Formal Invitation with Personalized Guest Salutation */}
        <FormalInvitationSection
          event={event}
          guest={currentGuest}
          palette={palette}
        />

        {/* Ceremony & Reception Venues */}
        <LocationsSection
          event={event}
          palette={palette}
        />

        {/* Interactive RSVP Form */}
        <RsvpSection
          event={event}
          guest={currentGuest}
          palette={palette}
          onRsvpSuccess={handleGuestRsvpUpdated}
        />

        {/* Wedding Day Schedule / Timeline */}
        <TimelineSection
          event={event}
          palette={palette}
        />

        {/* Emotional Declarations (Groom & Bride) */}
        <DeclarationsSection
          event={event}
          palette={palette}
        />

        {/* Guest Etiquette Guide */}
        <GuestManualSection
          event={event}
          palette={palette}
        />

        {/* Fine Art Photo Gallery */}
        <GallerySection
          event={event}
          palette={palette}
        />

        {/* Message from the Couple */}
        <CoupleMessageSection
          event={event}
          palette={palette}
        />

        {/* Final CTA & Personal QR Code Check-in Pass */}
        <FinalCtaAndQrSection
          event={event}
          guest={currentGuest}
          palette={palette}
          onRsvpClick={scrollToRsvp}
        />
      </main>

      {/* Ambient Wedding Music Player */}
      {event.enableMusic && (
        <AudioControl palette={palette} />
      )}
    </div>
  );
};
