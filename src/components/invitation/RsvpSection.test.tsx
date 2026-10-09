import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RsvpSection } from './RsvpSection';
import { DEFAULT_EVENT } from '../../data/defaultWeddingData';
import { COLOR_PALETTES } from '../../data/palettes';
import { Guest, WeddingEvent } from '../../types/wedding';

const paleta = COLOR_PALETTES[DEFAULT_EVENT.paletteId];

function convidado(rsvpStatus: Guest['rsvpStatus']): Guest {
  return {
    id: 'guest-teste-rsvp',
    eventId: DEFAULT_EVENT.id,
    name: 'Maria Convidada',
    salutationType: 'individual',
    token: 'RSVPTEST',
    maxGuests: 2,
    confirmedGuests: 0,
    rsvpStatus,
    accessCount: 0,
    qrStatus: 'active'
  };
}

function eventoComPrazo(rsvpDeadline: string): WeddingEvent {
  return { ...DEFAULT_EVENT, rsvpDeadline };
}

function secção(event: WeddingEvent, guest: Guest) {
  return (
    <RsvpSection
      event={event}
      guest={guest}
      palette={paleta}
      onRsvpSuccess={vi.fn()}
    />
  );
}

describe('RsvpSection — prazo de resposta', () => {
  it('prazo futuro → formulário com botões de resposta', () => {
    render(secção(eventoComPrazo('2099-12-31'), convidado('pending')));

    expect(screen.getByRole('button', { name: /Sim, Estarei Presente/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Infelizmente Não Poderei/ })).toBeInTheDocument();
    expect(screen.queryByText('Prazo de Resposta Encerrado')).not.toBeInTheDocument();
  });

  it('prazo passado sem resposta → aviso de prazo encerrado e sem formulário', () => {
    render(secção(eventoComPrazo('2020-01-01'), convidado('pending')));

    expect(screen.getByRole('heading', { name: 'Prazo de Resposta Encerrado' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sim, Estarei Presente/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Infelizmente Não Poderei/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Alterar minha resposta/ })).not.toBeInTheDocument();
  });

  it('prazo passado com resposta já dada → cartão de sucesso sem opção de editar', () => {
    render(secção(eventoComPrazo('2020-01-01'), convidado('confirmed')));

    expect(screen.getByRole('heading', { name: 'Presença Confirmada' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Alterar minha resposta/ })).not.toBeInTheDocument();
  });

  it('prazo futuro com resposta já dada → pode alterar a resposta', () => {
    render(secção(eventoComPrazo('2099-12-31'), convidado('confirmed')));

    expect(screen.getByRole('heading', { name: 'Presença Confirmada' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Alterar minha resposta/ })).toBeInTheDocument();
  });
});
