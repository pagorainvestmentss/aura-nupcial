import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PrintCard } from './PrintCard';
import { DEFAULT_EVENT } from '../../data/defaultWeddingData';
import { Guest, WeddingEvent } from '../../types/wedding';

// O qrcode usa canvas — em jsdom não existe, por isso mockamos o módulo.
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,QRTESTE')
  }
}));

function convidado(overrides: Partial<Guest> = {}): Guest {
  return {
    id: 'guest-print-teste',
    eventId: DEFAULT_EVENT.id,
    name: 'Maria Convidada',
    salutationType: 'individual',
    token: 'PRINTTEST',
    maxGuests: 2,
    confirmedGuests: 0,
    rsvpStatus: 'pending',
    accessCount: 0,
    qrStatus: 'active',
    ...overrides
  };
}

function eventoCom(overrides: Partial<WeddingEvent> = {}): WeddingEvent {
  return { ...DEFAULT_EVENT, ...overrides };
}

describe('PrintCard — saudação e conteúdo base', () => {
  it('mostra a saudação personalizada pelo nome e tipo', () => {
    render(<PrintCard event={eventoCom()} guest={convidado({ name: 'João Silva', salutationType: 'individual' })} />);

    expect(screen.getByRole('heading', { name: 'Querido(a) João Silva,' })).toBeInTheDocument();
  });

  it('usa o customSalutation quando definido', () => {
    render(
      <PrintCard
        event={eventoCom()}
        guest={convidado({ name: 'Família Silva', customSalutation: 'Querida Família Silva,' })}
      />
    );

    expect(screen.getByRole('heading', { name: 'Querida Família Silva,' })).toBeInTheDocument();
  });

  it('mostra os nomes dos noivos e a data', () => {
    render(<PrintCard event={eventoCom()} guest={convidado()} />);

    expect(screen.getByText(DEFAULT_EVENT.brideName)).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_EVENT.groomName)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(DEFAULT_EVENT.dateDisplay))).toBeInTheDocument();
  });

  it('mostra cerimónia e recepção com moradas', () => {
    render(<PrintCard event={eventoCom()} guest={convidado()} />);

    expect(screen.getByText(DEFAULT_EVENT.ceremony.venue)).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_EVENT.reception.venue)).toBeInTheDocument();
    if (DEFAULT_EVENT.ceremony.address) {
      expect(screen.getByText(DEFAULT_EVENT.ceremony.address)).toBeInTheDocument();
    }
  });
});

describe('PrintCard — bloco RSVP por estado', () => {
  it('confirmed → carimbo com nome, lugares, companions e data', () => {
    render(
      <PrintCard
        event={eventoCom()}
        guest={convidado({
          rsvpStatus: 'confirmed',
          confirmedGuests: 3,
          companions: ['Ana Silva', 'Pedro Silva'],
          rsvpDate: '2026-09-20T10:00:00.000Z',
          group: 'Noiva'
        })}
      />
    );

    expect(screen.getByText('Presença confirmada')).toBeInTheDocument();
    expect(screen.getByText(/Maria Convidada · 3 pessoas/)).toBeInTheDocument();
    expect(screen.getByText(/Com: Ana Silva, Pedro Silva/)).toBeInTheDocument();
    expect(screen.getByText('Noiva')).toBeInTheDocument();
    expect(screen.getByText(/Resposta registada em/)).toBeInTheDocument();
  });

  it('pending → aviso de prazo com a data limite', () => {
    render(
      <PrintCard
        event={eventoCom({ rsvpDeadline: '2099-12-31' })}
        guest={convidado({ rsvpStatus: 'pending' })}
      />
    );

    expect(screen.getByText('Aguardamos a sua resposta')).toBeInTheDocument();
    expect(screen.getByText(/Responda até/)).toBeInTheDocument();
    expect(screen.queryByText('Presença confirmada')).not.toBeInTheDocument();
  });

  it('declined → sem carimbo, só agradecimento', () => {
    render(<PrintCard event={eventoCom()} guest={convidado({ rsvpStatus: 'declined' })} />);

    expect(screen.getByText(/Obrigado por nos avisar/)).toBeInTheDocument();
    expect(screen.queryByText('Presença confirmada')).not.toBeInTheDocument();
    expect(screen.queryByText('Aguardamos a sua resposta')).not.toBeInTheDocument();
  });
});

describe('PrintCard — QR', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mostra o QR depois de gerar (enableQrValidation true)', async () => {
    render(<PrintCard event={eventoCom({ enableQrValidation: true })} guest={convidado()} />);

    await waitFor(() => {
      expect(screen.getByAltText('QR do convite')).toBeInTheDocument();
    });
    expect(screen.getByText('Check-in no dia do evento')).toBeInTheDocument();
  });

  it('muda a legenda do QR quando enableQrValidation é false', async () => {
    render(<PrintCard event={eventoCom({ enableQrValidation: false })} guest={convidado()} />);

    await waitFor(() => {
      expect(screen.getByAltText('QR do convite')).toBeInTheDocument();
    });
    expect(screen.getByText('Abra o convite digital')).toBeInTheDocument();
  });
});
