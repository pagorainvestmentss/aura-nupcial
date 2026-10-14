import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SaveTheDateSection } from './SaveTheDateSection';
import { DEFAULT_EVENT } from '../../data/defaultWeddingData';
import { COLOR_PALETTES } from '../../data/palettes';
import { OccasionId, WeddingEvent } from '../../types/wedding';

const palette = COLOR_PALETTES.sage;

function eventoCom(overrides: Partial<WeddingEvent> = {}): WeddingEvent {
  return { ...DEFAULT_EVENT, ...overrides };
}

const renderSecao = (event: WeddingEvent) =>
  render(
    <SaveTheDateSection event={event} palette={palette} onRsvpClick={() => {}} />
  );

describe('SaveTheDateSection — idade do aniversário', () => {
  it('aniversário com idade → mostra "30 ANOS" no topo', () => {
    renderSecao(
      eventoCom({ occasion: 'aniversario' as OccasionId, age: 30, brideName: 'Gabriel' })
    );

    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('anos')).toBeInTheDocument();
  });

  it('aniversário sem idade → não mostra nada', () => {
    renderSecao(eventoCom({ occasion: 'aniversario' as OccasionId }));

    expect(screen.queryByText('anos')).not.toBeInTheDocument();
  });

  it('outra ocasião com idade preenchida → não mostra', () => {
    renderSecao(eventoCom({ occasion: 'casamento', age: 30 }));

    expect(screen.queryByText('anos')).not.toBeInTheDocument();
  });
});
