import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router-dom';
import { InvitationPage } from './InvitationPage';
import { AuthProvider } from '../../app/AuthContext';
import { AuthSession } from '../../types/wedding';
import { WeddingStorageService } from '../../services/weddingStorage';

// Evita carregar a experiência completa (QR/canvas/animações) nestes testes
// de guarda — queremos apenas verificar quem entra e quem fica de fora.
vi.mock('../../components/invitation/InvitationExperience', () => ({
  InvitationExperience: () => <div data-testid="convite-aberto" />
}));

const SESSION_KEY = 'aura_session_v1';

function renderConvite(
  caminho: string,
  session: AuthSession | null = null,
  preparar?: () => void
) {
  localStorage.clear();
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  preparar?.();

  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        ),
        children: [{ path: 'convite/:eventSlug/:guestToken', element: <InvitationPage /> }]
      }
    ],
    { initialEntries: [caminho] }
  );

  render(<RouterProvider router={router} />);
}

const convidadoSessao: AuthSession = {
  role: 'cliente',
  email: 'mariana.pedro@auranupcial.com',
  displayName: 'Mariana & Pedro',
  coupleId: 'couple-mariana-pedro'
};

describe('InvitationPage — acesso por token (4.º ambiente)', () => {
  it('token inválido → Convite Não Encontrado', () => {
    renderConvite('/convite/mariana-pedro/TOKENERRADO');
    expect(screen.getByRole('heading', { name: 'Convite Não Encontrado' })).toBeInTheDocument();
    expect(screen.queryByTestId('convite-aberto')).not.toBeInTheDocument();
  });

  it('slug inexistente → Convite Não Encontrado', () => {
    renderConvite('/convite/nao-existe/8Fk92KsP');
    expect(screen.getByRole('heading', { name: 'Convite Não Encontrado' })).toBeInTheDocument();
  });

  it('evento suspenso → Convite Indisponível', () => {
    renderConvite('/convite/mariana-pedro/8Fk92KsP', null, () => {
      WeddingStorageService.init();
      WeddingStorageService.setEventStatus('event-mariana-pedro-2027', 'suspended');
    });
    expect(screen.getByRole('heading', { name: 'Convite Indisponível' })).toBeInTheDocument();
    expect(screen.queryByTestId('convite-aberto')).not.toBeInTheDocument();
  });

  it('casal suspenso → convite bloqueado', () => {
    renderConvite('/convite/mariana-pedro/8Fk92KsP', null, () => {
      WeddingStorageService.init();
      WeddingStorageService.setClientStatus('couple-mariana-pedro', 'suspended');
    });
    expect(screen.getByRole('heading', { name: 'Convite Indisponível' })).toBeInTheDocument();
  });

  it('evento em rascunho bloqueia convidado sem sessão', () => {
    renderConvite('/convite/mariana-pedro/8Fk92KsP', null, () => {
      WeddingStorageService.init();
      WeddingStorageService.setEventStatus('event-mariana-pedro-2027', 'draft');
    });
    expect(screen.getByRole('heading', { name: 'Convite Indisponível' })).toBeInTheDocument();
    expect(screen.queryByTestId('convite-aberto')).not.toBeInTheDocument();
  });

  it('rascunho + sessão do casal dono → pré-visualização permitida', () => {
    renderConvite('/convite/mariana-pedro/8Fk92KsP', convidadoSessao, () => {
      WeddingStorageService.init();
      WeddingStorageService.setEventStatus('event-mariana-pedro-2027', 'draft');
    });
    expect(screen.getByTestId('convite-aberto')).toBeInTheDocument();
    expect(screen.getByText(/Pré-visualização/)).toBeInTheDocument();
  });

  it('rascunho + sessão de OUTRO casal → bloqueado', () => {
    renderConvite(
      '/convite/mariana-pedro/8Fk92KsP',
      { role: 'cliente', email: 'sofia.andre@auranupcial.com', displayName: 'Sofia & André', coupleId: 'couple-sofia-andre' },
      () => {
        WeddingStorageService.init();
        WeddingStorageService.setEventStatus('event-mariana-pedro-2027', 'draft');
      }
    );
    expect(screen.getByRole('heading', { name: 'Convite Indisponível' })).toBeInTheDocument();
  });

  it('evento activo + token válido → convite abre e regista o acesso', () => {
    renderConvite('/convite/mariana-pedro/8Fk92KsP');
    expect(screen.getByTestId('convite-aberto')).toBeInTheDocument();

    const depois = WeddingStorageService.getGuests().find((g) => g.id === 'guest-1')!;
    expect(depois.accessCount).toBeGreaterThanOrEqual(1);
    expect(depois.accessedAt).toBeTruthy();
  });

  // Os gates correm ANTES da contagem de aberturas: convites bloqueados
  // não podem inflar "Convites abertos" nos relatórios.
  function lerAcessos(id: string) {
    return WeddingStorageService.getGuests().find((g) => g.id === id)?.accessCount ?? 0;
  }

  it('evento suspenso NÃO conta abertura', () => {
    let antes = 0;
    renderConvite('/convite/mariana-pedro/8Fk92KsP', null, () => {
      WeddingStorageService.init();
      antes = lerAcessos('guest-1');
      WeddingStorageService.setEventStatus('event-mariana-pedro-2027', 'suspended');
    });
    expect(screen.getByRole('heading', { name: 'Convite Indisponível' })).toBeInTheDocument();
    expect(lerAcessos('guest-1')).toBe(antes);
  });

  it('evento em rascunho NÃO conta abertura (sem sessão)', () => {
    let antes = 0;
    renderConvite('/convite/mariana-pedro/8Fk92KsP', null, () => {
      WeddingStorageService.init();
      antes = lerAcessos('guest-1');
      WeddingStorageService.setEventStatus('event-mariana-pedro-2027', 'draft');
    });
    expect(screen.getByRole('heading', { name: 'Convite Indisponível' })).toBeInTheDocument();
    expect(lerAcessos('guest-1')).toBe(antes);
  });

  it('pré-visualização do casal (rascunho) NÃO conta abertura', () => {
    let antes = 0;
    renderConvite('/convite/mariana-pedro/8Fk92KsP', convidadoSessao, () => {
      WeddingStorageService.init();
      antes = lerAcessos('guest-1');
      WeddingStorageService.setEventStatus('event-mariana-pedro-2027', 'draft');
    });
    expect(screen.getByTestId('convite-aberto')).toBeInTheDocument();
    expect(lerAcessos('guest-1')).toBe(antes);
  });
});
