import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ClientLayout } from '../layouts/ClientLayout';
import { InvitationLayout } from '../layouts/InvitationLayout';
import { RequireAuth } from './RequireAuth';
import { PageTransition } from '../components/motion/PageTransition';
import { PageSkeleton } from '../components/motion/Skeleton';

/**
 * Lazy loading por rota: cada página é um chunk próprio, carregado só quando é
 * necessária. Enquanto carrega, o `PageTransition` mostra o esqueleto da área
 * (dentro do shell — cabeçalho/sidebar continuam no ecrã).
 */
const publicPage = (node: React.ReactNode) => (
  <PageTransition fallback={<PageSkeleton variant="public" />}>{node}</PageTransition>
);
const adminPage = (node: React.ReactNode) => (
  <PageTransition fallback={<PageSkeleton variant="admin" />}>{node}</PageTransition>
);
const clientPage = (node: React.ReactNode) => (
  <PageTransition fallback={<PageSkeleton variant="client" />}>{node}</PageTransition>
);
const invitationPage = (node: React.ReactNode) => (
  <PageTransition fallback={<PageSkeleton variant="invitation" />}>{node}</PageTransition>
);

// Site público
const HomePage = React.lazy(() =>
  import('../routes/public/HomePage').then((m) => ({ default: m.HomePage }))
);
const ComoFuncionaPage = React.lazy(() =>
  import('../routes/public/ComoFuncionaPage').then((m) => ({ default: m.ComoFuncionaPage }))
);
const ExemplosPage = React.lazy(() =>
  import('../routes/public/ExemplosPage').then((m) => ({ default: m.ExemplosPage }))
);
const PacotesPage = React.lazy(() =>
  import('../routes/public/PacotesPage').then((m) => ({ default: m.PacotesPage }))
);
const FaqPage = React.lazy(() =>
  import('../routes/public/FaqPage').then((m) => ({ default: m.FaqPage }))
);
const ContactoPage = React.lazy(() =>
  import('../routes/public/ContactoPage').then((m) => ({ default: m.ContactoPage }))
);
const AdquirirPage = React.lazy(() =>
  import('../routes/public/AdquirirPage').then((m) => ({ default: m.AdquirirPage }))
);
const CriarContaPage = React.lazy(() =>
  import('../routes/public/CriarContaPage').then((m) => ({ default: m.CriarContaPage }))
);
const LoginPage = React.lazy(() =>
  import('../routes/public/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const NotFoundPage = React.lazy(() =>
  import('../routes/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Admin
const AdminDashboardPage = React.lazy(() =>
  import('../routes/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminClientesPage = React.lazy(() =>
  import('../routes/admin/AdminClientesPage').then((m) => ({ default: m.AdminClientesPage }))
);
const AdminEventosPage = React.lazy(() =>
  import('../routes/admin/AdminEventosPage').then((m) => ({ default: m.AdminEventosPage }))
);
const AdminConvidadosPage = React.lazy(() =>
  import('../routes/admin/AdminConvidadosPage').then((m) => ({ default: m.AdminConvidadosPage }))
);
const AdminRsvpPage = React.lazy(() =>
  import('../routes/admin/AdminRsvpPage').then((m) => ({ default: m.AdminRsvpPage }))
);
const AdminQrCheckinPage = React.lazy(() =>
  import('../routes/admin/AdminQrCheckinPage').then((m) => ({ default: m.AdminQrCheckinPage }))
);
const AdminTemplatesPage = React.lazy(() =>
  import('../routes/admin/AdminTemplatesPage').then((m) => ({ default: m.AdminTemplatesPage }))
);
const AdminPagamentosPage = React.lazy(() =>
  import('../routes/admin/AdminPagamentosPage').then((m) => ({ default: m.AdminPagamentosPage }))
);
const AdminRelatoriosPage = React.lazy(() =>
  import('../routes/admin/AdminRelatoriosPage').then((m) => ({ default: m.AdminRelatoriosPage }))
);
const AdminConfiguracoesPage = React.lazy(() =>
  import('../routes/admin/AdminConfiguracoesPage').then((m) => ({
    default: m.AdminConfiguracoesPage
  }))
);

// Cliente (casal)
const ClientVisaoGeralPage = React.lazy(() =>
  import('../routes/client/ClientVisaoGeralPage').then((m) => ({ default: m.ClientVisaoGeralPage }))
);
const ClientMeuConvitePage = React.lazy(() =>
  import('../routes/client/ClientMeuConvitePage').then((m) => ({ default: m.ClientMeuConvitePage }))
);
const ClientConvidadosPage = React.lazy(() =>
  import('../routes/client/ClientConvidadosPage').then((m) => ({ default: m.ClientConvidadosPage }))
);
const ClientRsvpPage = React.lazy(() =>
  import('../routes/client/ClientRsvpPage').then((m) => ({ default: m.ClientRsvpPage }))
);
const ClientDadosPage = React.lazy(() =>
  import('../routes/client/ClientDadosPage').then((m) => ({ default: m.ClientDadosPage }))
);

// Convidado
const InvitationPage = React.lazy(() =>
  import('../routes/invitation/InvitationPage').then((m) => ({ default: m.InvitationPage }))
);

/**
 * Mapa de rotas — 4 ambientes estritamente separados:
 *   /                     → SITE PÚBLICO (marca)
 *   /admin/*              → ADMIN (guard role=admin)
 *   /cliente/*            → CLIENTE/casal (guard role=cliente)
 *   /convite/:slug/:token → CONVIDADO (sem dashboard, sem sessão)
 *
 * As permissões reais serão forçadas no backend (Supabase RLS);
 * estes guards são apenas o espelho frontend.
 *
 * Em hosts com subcaminho (ex.: GitHub Pages /aura-nupcial/) o React Router
 * precisa do basename para fazer match das rotas sem o prefixo.
 */
const basename =
  import.meta.env.BASE_URL === '/'
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/+$/, '');

export const router = createBrowserRouter(
  [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: publicPage(<HomePage />) },
      { path: 'como-funciona', element: publicPage(<ComoFuncionaPage />) },
      { path: 'exemplos', element: publicPage(<ExemplosPage />) },
      { path: 'pacotes', element: publicPage(<PacotesPage />) },
      { path: 'faq', element: publicPage(<FaqPage />) },
      { path: 'contacto', element: publicPage(<ContactoPage />) },
      { path: 'adquirir', element: publicPage(<AdquirirPage />) },
      { path: 'criar', element: publicPage(<CriarContaPage />) },
      { path: 'login', element: publicPage(<LoginPage />) },
      { path: '*', element: publicPage(<NotFoundPage />) }
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
      { index: true, element: adminPage(<AdminDashboardPage />) },
      { path: 'clientes', element: adminPage(<AdminClientesPage />) },
      { path: 'eventos', element: adminPage(<AdminEventosPage />) },
      { path: 'convidados', element: adminPage(<AdminConvidadosPage />) },
      { path: 'rsvp', element: adminPage(<AdminRsvpPage />) },
      { path: 'qr-checkin', element: adminPage(<AdminQrCheckinPage />) },
      { path: 'templates', element: adminPage(<AdminTemplatesPage />) },
      { path: 'pagamentos', element: adminPage(<AdminPagamentosPage />) },
      { path: 'relatorios', element: adminPage(<AdminRelatoriosPage />) },
      { path: 'configuracoes', element: adminPage(<AdminConfiguracoesPage />) },
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
      { index: true, element: clientPage(<ClientVisaoGeralPage />) },
      { path: 'convite', element: clientPage(<ClientMeuConvitePage />) },
      { path: 'convidados', element: clientPage(<ClientConvidadosPage />) },
      { path: 'rsvp', element: clientPage(<ClientRsvpPage />) },
      { path: 'dados', element: clientPage(<ClientDadosPage />) },
      { path: '*', element: <Navigate to="/cliente" replace /> }
    ]
  },
  {
    path: '/convite/:eventSlug/:guestToken',
    element: <InvitationLayout />,
    children: [{ index: true, element: invitationPage(<InvitationPage />) }]
  }
], { basename });
