import { createBrowserRouter, Navigate } from 'react-router-dom';

import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ClientLayout } from '../layouts/ClientLayout';
import { InvitationLayout } from '../layouts/InvitationLayout';
import { RequireAuth } from './RequireAuth';

// Site público
import { HomePage } from '../routes/public/HomePage';
import { ComoFuncionaPage } from '../routes/public/ComoFuncionaPage';
import { ExemplosPage } from '../routes/public/ExemplosPage';
import { PacotesPage } from '../routes/public/PacotesPage';
import { FaqPage } from '../routes/public/FaqPage';
import { ContactoPage } from '../routes/public/ContactoPage';
import { AdquirirPage } from '../routes/public/AdquirirPage';
import { CriarContaPage } from '../routes/public/CriarContaPage';
import { LoginPage } from '../routes/public/LoginPage';
import { NotFoundPage } from '../routes/NotFoundPage';

// Admin
import { AdminDashboardPage } from '../routes/admin/AdminDashboardPage';
import { AdminClientesPage } from '../routes/admin/AdminClientesPage';
import { AdminEventosPage } from '../routes/admin/AdminEventosPage';
import { AdminConvidadosPage } from '../routes/admin/AdminConvidadosPage';
import { AdminRsvpPage } from '../routes/admin/AdminRsvpPage';
import { AdminQrCheckinPage } from '../routes/admin/AdminQrCheckinPage';
import { AdminTemplatesPage } from '../routes/admin/AdminTemplatesPage';
import { AdminPagamentosPage } from '../routes/admin/AdminPagamentosPage';
import { AdminRelatoriosPage } from '../routes/admin/AdminRelatoriosPage';
import { AdminConfiguracoesPage } from '../routes/admin/AdminConfiguracoesPage';

// Cliente (casal)
import { ClientVisaoGeralPage } from '../routes/client/ClientVisaoGeralPage';
import { ClientMeuConvitePage } from '../routes/client/ClientMeuConvitePage';
import { ClientConvidadosPage } from '../routes/client/ClientConvidadosPage';
import { ClientRsvpPage } from '../routes/client/ClientRsvpPage';
import { ClientDadosPage } from '../routes/client/ClientDadosPage';

// Convidado
import { InvitationPage } from '../routes/invitation/InvitationPage';

/**
 * Mapa de rotas — 4 ambientes estritamente separados:
 *   /                     → SITE PÚBLICO (marca)
 *   /admin/*              → ADMIN (guard role=admin)
 *   /cliente/*            → CLIENTE/casal (guard role=cliente)
 *   /convite/:slug/:token → CONVIDADO (sem dashboard, sem sessão)
 *
 * As permissões reais serão forçadas no backend (Supabase RLS);
 * estes guards são apenas o espelho frontend.
 */
// Em hosts com subcaminho (ex.: GitHub Pages /aura-nupcial/) o React Router
// precisa do basename para fazer match das rotas sem o prefixo.
const basename =
  import.meta.env.BASE_URL === '/'
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/+$/, '');

export const router = createBrowserRouter(
  [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'como-funciona', element: <ComoFuncionaPage /> },
      { path: 'exemplos', element: <ExemplosPage /> },
      { path: 'pacotes', element: <PacotesPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'contacto', element: <ContactoPage /> },
      { path: 'adquirir', element: <AdquirirPage /> },
      { path: 'criar', element: <CriarContaPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: '*', element: <NotFoundPage /> }
    ]
  },
  {
    path: '/admin',
    element: (
      <RequireAuth role="admin">
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'clientes', element: <AdminClientesPage /> },
      { path: 'eventos', element: <AdminEventosPage /> },
      { path: 'convidados', element: <AdminConvidadosPage /> },
      { path: 'rsvp', element: <AdminRsvpPage /> },
      { path: 'qr-checkin', element: <AdminQrCheckinPage /> },
      { path: 'templates', element: <AdminTemplatesPage /> },
      { path: 'pagamentos', element: <AdminPagamentosPage /> },
      { path: 'relatorios', element: <AdminRelatoriosPage /> },
      { path: 'configuracoes', element: <AdminConfiguracoesPage /> },
      { path: '*', element: <Navigate to="/admin" replace /> }
    ]
  },
  {
    path: '/cliente',
    element: (
      <RequireAuth role="cliente">
        <ClientLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <ClientVisaoGeralPage /> },
      { path: 'convite', element: <ClientMeuConvitePage /> },
      { path: 'convidados', element: <ClientConvidadosPage /> },
      { path: 'rsvp', element: <ClientRsvpPage /> },
      { path: 'dados', element: <ClientDadosPage /> },
      { path: '*', element: <Navigate to="/cliente" replace /> }
    ]
  },
  {
    path: '/convite/:eventSlug/:guestToken',
    element: <InvitationLayout />,
    children: [{ index: true, element: <InvitationPage /> }]
  }
], { basename });
