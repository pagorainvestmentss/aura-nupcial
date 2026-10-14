# Aura Nupcial — Arquitectura da Plataforma

> **Fase 1 (actual):** site completo e navegável com dados de demonstração em `localStorage`.
> **Supabase:** apenas arquitectura de backend documentada (secção 9) — nada dessa camada está implementado.

---

## 1. Visão geral

Plataforma de convites de casamento digitais com **quatro ambientes estritamente separados**:

| # | Ambiente | URL | Quem entra | Interface |
|---|----------|-----|-----------|-----------|
| 1 | **Site público** (marca) | `/` | Visitantes / prospects | Funil auto-serviço: landing → 4 ocasiões → conta (email + WhatsApp) → pacote |
| 2 | **Admin** (plataforma) | `/admin/*` | Equipa Aura Nupcial | Sistema administrativo completo |
| 3 | **Cliente** (casal) | `/cliente/*` | Noivos contratantes | Painel simples, sem jargão técnico |
| 4 | **Convidado** | `/convite/:eventSlug/:guestToken` | Convidados do casamento | Convite imersivo, **sem dashboard, sem sessão** |

**Regras de separação (invioláveis):**

- Nunca misturar os quatro ambientes num único menu ou dashboard.
- O convidado **nunca** vê sidebar, menu de gestão ou qualquer UI de admin/cliente.
- O cliente **nunca** vê termos como *token*, *API*, *log*, *payload*, *endpoint*.
- O admin é um sistema administrativo — **não** uma página de casamento.
- `InvitationLayout` não herda visualmente dos layouts de admin/cliente.
- As permissões serão forçadas no **backend** (Supabase RLS); os guards frontend são apenas o espelho.

---

## 2. Stack e comandos

| Item | Definição |
|------|-----------|
| Build | Vite 8 + React 19 + TypeScript (sem `strict`) + Tailwind CSS 4 |
| Router | `react-router-dom` (`createBrowserRouter`) |
| QR Code | `qrcode` (geração **local**, nunca APIs externas) |
| Persistência actual | `localStorage` (chaves `aura_*_v2`, `aura_settings_v1`, sessão `aura_session_v1`) |
| Alias | `@` → raiz do projecto |
| Nota | `esbuild` fixado em `^0.28.2` (evita conflito ERESOLVE com vite@8) |

```bash
npm run dev      # vite --port=3000 (HMR desactivado via env DISABLE_HMR — não alterar)
npm run lint     # tsc --noEmit  ← obrigatório após cada alteração
npm test         # Vitest (jsdom) — 59 testes; também corre no CI de cada PR
npm run build    # produção
```

---

## 3. Sitemap — as 4 áreas

### 3.1 Site público (`PublicLayout`)

| Rota | Página | Função |
|------|--------|--------|
| `/` | `HomePage` | Hero, **selector das 4 ocasiões**, proposta de valor, prova social |
| `/criar` | `CriarContaPage` | Passo 1 ocasião + Passo 2 conta (email + WhatsApp, sem password); `?ocasiao=X&plano=Y` pré-seleciona |
| `/como-funciona` | `ComoFuncionaPage` | Processo em 4 passos |
| `/exemplos` | `ExemplosPage` | Galeria de convites reais |
| `/pacotes` | `PacotesPage` | Preços (Starter 45.000 Kz · Pro 120.000 Kz · Premium 200.000 Kz) → `/criar?plano=` |
| `/faq` | `FaqPage` | Perguntas frequentes |
| `/contacto` | `ContactoPage` | Formulário / WhatsApp `wa.me/244940989328` |
| `/adquirir` | `AdquirirPage` | Seletor de ocasião + planos + CTA |
| `/login` | `LoginPage` | Entrada às áreas `cliente`/`admin` (cliente: só email; admin: password) |
| `*` | `NotFoundPage` | Erro 404 público |

### 3.2 Admin (`AdminLayout` + `RequireAuth role="admin"`)

| Rota | Página | Função |
|------|--------|--------|
| `/admin` | `AdminDashboardPage` | Métricas globais (clientes, eventos, RSVP, QR) |
| `/admin/clientes` | `AdminClientesPage` | CRUD de clientes, suspensão, pagamentos |
| `/admin/eventos` | `AdminEventosPage` | Criar/publicar/despublicar/apagar eventos |
| `/admin/convidados` | `AdminConvidadosPage` | Convidados globais, copiar link, QR |
| `/admin/rsvp` | `AdminRsvpPage` | RSVP global com filtros + export CSV |
| `/admin/qr-checkin` | `AdminQrCheckinPage` | Terminal de validação de passes |
| `/admin/templates` | `AdminTemplatesPage` | 4 templates + atribuição a eventos |
| `/admin/pagamentos` | `AdminPagamentosPage` | Pedidos de pagamento (referência + confirmação auditada) e estado por cliente |
| `/admin/relatorios` | `AdminRelatoriosPage` | Relatórios por evento + CSV |
| `/admin/configuracoes` | `AdminConfiguracoesPage` | Definições da plataforma, reset de dados demo |
| `*` | redirect → `/admin` | |

### 3.3 Cliente / casal (`ClientLayout` + `RequireAuth role="cliente"`)

| Rota | Página | Função |
|------|--------|--------|
| `/cliente` | `ClientVisaoGeralPage` | Resumo: estado do convite, contagens de RSVP |
| `/cliente/convite` | `ClientMeuConvitePage` | Preview, link público, QR, identidade visual |
| `/cliente/convidados` | `ClientConvidadosPage` | Gestão de convidados (CRUD + link individual) |
| `/cliente/rsvp` | `ClientRsvpPage` | Confirmações com filtros + CSV |
| `/cliente/dados` | `ClientDadosPage` | Editar dados do casamento (data, versículo, cerimónia…) |
| `*` | redirect → `/cliente` | |

### 3.4 Convidado (`InvitationLayout` — só `<Outlet/>`)

| Rota | Página | Função |
|------|--------|--------|
| `/convite/:eventSlug/:guestToken` | `InvitationPage` | Envelope → convite completo → RSVP → QR |
| `/convite/:eventSlug/:guestToken/imprimir` | `PrintInvitationPage` | Cartão A5 imprimível (RSVP + QR), sem envelope/música/botões |

- **Token inválido** → `InvalidInvitation reason="not_found"`.
- **Evento `draft`/`suspended`** → `InvalidInvitation reason="revoked"`.
- Barra flutuante **"Demo:"** (classe `no-print`) alterna convidados para demonstração.
- **Impressão**: o cliente abre o cartão a partir de `/cliente/convite` (botão "Imprimir cartão") ou das linhas de `/cliente/convidados` e `/cliente/rsvp` (ícone Printer). O carregamento do convite (anónimo via RPC ou cliente via leitura directa) vive em `useInviteByToken`, partilhado entre `InvitationPage` e `PrintInvitationPage`. O cartão usa `PrintCard` (paleta do evento, saudação personalizada, bloco RSVP por estado: confirmed/pending/declined) e o CSS `@media print` de `index.css` força `@page A5 portrait` + `print-color-adjust: exact`.

---

## 4. Roles e permissões

| Acção | Público | Convidado | Cliente (casal) | Admin |
|-------|:-------:|:---------:|:---------------:|:-----:|
| Ver site / preços / FAQ | ✅ | ✅ | ✅ | ✅ |
| Abrir convite pelo link | — | ✅ | ✅ | ✅ |
| Responder (RSVP) ao convite | — | ✅ | — | — |
| Gerir **o seu** evento e convidados | — | — | ✅ | — |
| Ver RSVP/relatórios do **seu** evento | — | — | ✅ | — |
| Gerir clientes, eventos, templates, pagamentos | — | — | — | ✅ |
| Check-in QR, relatórios globais, configurações | — | — | — | ✅ |
| Gerir outros casais/Eventos | — | — | ❌ | ✅ |

**Dupla barreira (projecto):**

1. **Frontend (actual):** `RequireAuth` (`src/app/RequireAuth.tsx`) — verifica sessão e `role`; sessão do ambiente errado redirecciona para o ambiente próprio. É apenas UX.
2. **Backend (Fase 2 — Supabase):** RLS obriga a que cada *query* só devolve linhas do próprio `couple_id`/`role`. Sem sessão válida não há dados — mesmo que alguém force chamadas à API.

---

## 5. Fluxos principais

### 5.1 Cadeia de demonstração (validada)

```
1. Admin cria cliente e evento        → /admin/clientes + /admin/eventos
2. Casal gere o seu convite           → /cliente (login: mariana.pedro@auranupcial.com / demo123)
3. Convidado abre o link              → /convite/mariana-pedro/8Fk92KsP (envelope + RSVP)
4. RSVP reflecte nos painéis          → /cliente/rsvp e /admin/rsvp actualizados
5. QR check-in no dia                 → /admin/qr-checkin valida o token do convidado
```

### 5.2 Funil público auto-serviço (F1–F8)

```
/ ou /adquirir → escolhe ocasião (casamento · noivado · aniversário · outra)
  → /criar?ocasiao=X&plano=Y → conta (email + WhatsApp, sem password)
      cria Couple(plan, paymentStatus:'pending') + WeddingEvent(occasion, slug, draft)
  → /cliente (Primeiros passos + seletor de pacote; Starter limita 30 convidados)
  → cliente gera pedido de pagamento (referência AURA-XXXX, valor do plano)
      paga por IBAN ou Multicaixa Express e envia comprovativo por WhatsApp
  → admin confirma pedido em /admin/pagamentos
      → payment_requests.status='paid' + couple.paymentStatus='paid'
        (activa pendingPlan quando é upgrade)
  → cliente publica            → event.status='active'   [GATE: exige paid]
  → link /convite/:slug/:token funciona para convidados
```

Admin continua com supervisão completa (criar/editar evento, ocasião, suspender).

### 5.3 RSVP do convidado (sem login)

```
Link /convite/:slug/:token
  → evento e convidado resolvidos pelo token (case-insensitive)
  → recordAccess() regista abertura
  → RSVP escolhido grava rsvpStatus + rsvpDate + notas/alimentar
  → leitura imediata em /cliente/rsvp e /admin/rsvp (mesmo armazenamento)
```

### 5.4 Check-in QR

```
/admin/qr-checkin → introduz token ou URL (ou cola)
  → valida: existe? evento activo? QR já usado?
  → devolve: VÁLIDO / JÁ UTILIZADO / CONVITE INVÁLIDO
  → marca qrStatus='used' + qrScannedAt + qrScannedBy
```

### 5.5 Estados do evento

```
draft ──publicar──▶ active ──suspender──▶ suspended
  │                   │                      │
  └── convite mostra "indisponível" ─────────┘

GATE de publicação: publicar exige couple.paymentStatus === 'paid'
(Admin: confirma pedidos em /admin/pagamentos — confirmação auditada com
referência, data e email de quem confirmou; o casal NÃO se pode auto-confirmar
— trigger enforce_couples_commercial_guard em produção, RLS + UI no modo local).
Visitante + evento draft/suspended ou casal suspenso → InvalidInvitation.
```

---

## 6. Modelo de dados

### 6.1 Entidades (tipos em `src/types/wedding.ts`)

```
Couple (1) ──── (N) WeddingEvent (1) ──── (N) Guest
   │                    │
   │                    ├── occasion                → casamento/noivado/aniversario/outra
   │                    ├── templateId + paletteId  → tema visual
   │                    ├── ceremony / reception    → locais e horários
   │                    ├── timeline[]              → cronograma
   │                    ├── declarations{}          → declarações dos noivos
   │                    ├── gallery[]               → fotos
   │                    └── guestManual[]           → manual do convidado
   ├── plan, status, paymentStatus, pendingPlan?, password (opcional)
   └── (N) PaymentRequest
           ├── reference (AURA-XXXX, única) · amountKz · plan · kind
           │   (initial | upgrade)
           ├── status (pending | paid | cancelled)
           └── createdAt, paidAt?, confirmedBy?   → auditoria da confirmação

PlatformSettings (singleton) → nome da marca, email, telefone,
                               dados de pagamento (IBAN, MCX Express, titular)
AuthSession (em memória)     → role, email, displayName, coupleId?
```

### 6.2 Enums

| Tipo | Valores |
|------|---------|
| `EventStatus` | `draft` · `preview` · `active` · `suspended` |
| `RsvpStatus` | `pending` · `confirmed` · `declined` · `partially_confirmed` |
| `QrStatus` | `active` · `used` · `revoked` |
| `ClientStatus` | `active` · `suspended` |
| `PaymentStatus` | `paid` · `pending` · `overdue` |
| `PlanId` | `essential` · `pro` |
| `OccasionId` | `casamento` · `noivado` · `aniversario` · `outra` |
| `UserRole` | `admin` · `cliente` |
| `SalutationType` | `individual` · `couple` · `family` · `custom` |
| `templateId` | `botanical-sage` · `elegance-terracotta` · `classic-gold` · `romance-rose` |

### 6.3 Persistência — modo local (`VITE_DATA_BACKEND=local`)

> Em produção o backend é o **Supabase** (§9); estas chaves `localStorage` são o modo
> demo/dev, acessível via `localRepository` (`src/services/localRepository.ts`). A UI fala
> sempre com a interface `WeddingRepository`, nunca directamente com o `localStorage`.

| Chave `localStorage` | Conteúdo |
|----------------------|----------|
| `aura_*_v2` | Seed: 3 casais, 3 eventos, 14 convidados (re-seed se ausente) |
| `aura_settings_v1` | `PlatformSettings` |
| `aura_session_v1` | `AuthSession` da UI |

Serviços: `src/services/weddingStorage.ts` (CRUD + `recordAccess` + `validateQrCheckIn` + `resetToSeed`).

**Camada de ocasião:** `src/data/occasions.ts` — `getOccasion`, `eventNames`, `formalPhrase`, `fallbackNames`, `isCoupleOccasion`. Eventos **seed/antigos sem `occasion`** são migrados no arranque por `WeddingStorageService.init()` → `migrateEventOccasions()` (backfill `'casamento'`); `isCoupleOccasion(undefined)` também conta como casamento (defesa em profundidade).

**Onboarding:** `src/services/onboarding.ts` — `createBlankEvent` (evento vazio por ocasião, nunca `spread(DEFAULT_EVENT)`) + `createAccount` (evento slug único + plano do URL).

### 6.4 Dados de demonstração

| Conta | Credenciais |
|-------|-------------|
| Admin | `admin@auranupcial.com` / `admin123` |
| Casais (×3) | `mariana.pedro@`, `sofia.andre@`, `joana.miguel@` `…@auranupcial.com` / `demo123` |
| Convite demo | `/convite/mariana-pedro/8Fk92KsP` |
| Galeria `/exemplos` | Cartões clicáveis → `/convite/mariana-pedro/8Fk92KsP`, `/convite/sofia-andre/marta-4Rc8Bn`, `/convite/joana-miguel/domingos-3Vn9Pa` |

> Em produção os mesmos 3 convites demo (e os mesmos tokens) são criados pela migração
> `20261014091000_seed_demo_invitations.sql` — idempotente, corre depois da limpeza da Fase 2 (§9.6).

---

## 7. Wireframes (layouts)

### 7.1 Público
```
┌──────────────────────────────────────────────┐
│ logo   Como funciona · Exemplos · Pacotes ·  │
│        FAQ · Contacto            [Entrar]    │  ← PublicLayout
├──────────────────────────────────────────────┤
│                                              │
│              HERO / CONTEÚDO                 │
│                                              │
├──────────────────────────────────────────────┤
│ footer (marca, acessos, ©)                   │
└──────────────────────────────────────────────┘
```

### 7.2 Admin
```
┌────────────┬──────────────────────────────────┐
│ AURA Admin │  topo: "Painel Administrativo"   │
│            │  [Ambiente Admin]                │  ← AdminLayout
│ Dashboard  ├──────────────────────────────────┤
│ Clientes   │                                  │
│ Eventos    │        CONTEÚDO (tabelas,        │
│ Convidados │        métricas, formulários)    │
│ RSVP       │                                  │
│ QR Check-in│                                  │
│ Templates  │                                  │
│ Pagamentos │                                  │
│ Relatórios │                                  │
│ Config.    │                                  │
│ ────────── │                                  │
│ email      │                                  │
│ [Sair]     │                                  │
└────────────┴──────────────────────────────────┘
```

### 7.3 Cliente (tom humano, sem jargão)
```
┌─────────────────┬──────────────────────────────┐
│ AURA            │  topo: "Bem-vindos de volta" │
│ A área dos      │  [Área dos noivos]           │  ← ClientLayout
│ noivos          ├──────────────────────────────┤
│ Mariana & Pedro │                              │
│ 15 JAN 2027     │       CONTEÚDO               │
│ ─────────────── │   (cartões simples,          │
│ Visão geral     │    listas, botões claros)    │
│ Meu convite     │                              │
│ Convidados      │                              │
│ Confirmações    │                              │
│ Dados do casam. │                              │
│ [Ver convite]   │                              │
│ [Sair]          │                              │
└─────────────────┴──────────────────────────────┘
```

### 7.4 Convidado (editorial, imersivo — sem qualquer chrome de gestão)
```
┌──────────────────────────────────────────────┐
│  ENVELOPE (abertura cinematográfica)         │
│  "Para João Manuel"  [Abrir convite]         │  ← InvitationLayout
├──────────────────────────────────────────────┤
│  hero + monograma                            │
│  versículo · convite formal                  │
│  locais · RSVP · cronograma                  │
│  declarações · manual · galeria · recado     │
│  QR individual (passe de acesso)             │
├──────────────────────────────────────────────┤
│ [Demo: convidado A · B · C]  (só no-print)   │
└──────────────────────────────────────────────┘
```

---

## 8. Estrutura de código

```
src/
├── app/
│   ├── AuthContext.tsx        # sessão, login, logout (espelho de Supabase Auth)
│   ├── RequireAuth.tsx        # guard por role (espelho de RLS)
│   └── router.tsx             # mapa completo das 4 áreas
├── layouts/                   # PublicLayout · AdminLayout · ClientLayout · InvitationLayout
├── routes/
│   ├── public/                # 8 páginas + LoginPage
│   ├── admin/                 # 10 páginas
│   ├── client/                # 5 páginas + useClientEvent.ts
│   ├── invitation/            # InvitationPage (envelope, shell, demo switcher)
│   └── NotFoundPage.tsx
├── components/
│   ├── invitation/            # InvitationExperience + 14 secções + InvalidInvitation
│   └── common/                # BotanicalFlourish
├── services/weddingStorage.ts # CRUD, RSVP, QR, seed
├── data/                      # defaultWeddingData.ts (seed) · palettes.ts
└── types/wedding.ts           # modelo de dados
```

---

## 9. Migração para Supabase (Fase 2 — IMPLEMENTADA)

> **Estado (Fase 2, Issue #29):** o backend real está activo em produção. A camada de dados é
> **assíncrona** e passa por uma interface única `WeddingRepository` (`src/services/repository.ts`)
> com duas implementações: `localRepository` (localStorage — modo demo/dev) e `supabaseRepository`
> (Supabase Auth + Postgres — produção). A fábrica `getRepo()` (`src/services/repo.ts`) escolhe a
> implementação pela variável `VITE_DATA_BACKEND=supabase|local` (por omissão `local`).
>
> `AuthContext` ficou **assíncrono** (`login`/`register` devolvem `Promise`). O `register` cria o
> casal + evento + slug **no servidor** via trigger `handle_new_user` (migração `…_signup_creates_couple.sql`),
> usando os metadados do `signUp`; daí o ecrã "Quase lá!" a pedir confirmação de email.
> Convidado continua **sem conta** — convite por token via RPC pública `resolve_invitation`.
> RLS activo em todas as tabelas; a leitura anónima de `events`/`guests` faz-se só pela RPC.

### 9.1 Auth

| Actual (demo) | Futuro (Supabase) |
|---------------|-------------------|
| Contas em código + `localStorage` | **Supabase Auth** (email/password) |
| `AuthSession` local | JWT de sessão |
| Papel em `AuthSession.role` | `profiles.role` + claims |

Mapeamento: `admin` → utilizador com `role='admin'`; `cliente` → perfil ligado a `couples.id`; convidado → **sem conta** (link com token).

### 9.2 Tabelas propostas

```
profiles        (id uuid PK = auth.users.id, role, display_name, created_at)
couples         (id, name, email, phone, plan, status, payment_status,
                 password_reminder?, created_at)          -- auth via profiles
events          (id, couple_id → couples, slug UNIQUE, status, template_id,
                 palette_id, date_iso, date_display, location_display,
                 verse_*, invitation_intro, ceremony_*, reception_*,
                 hero_photo, intimate_photo, rings_photo, timeline jsonb,
                 declarations jsonb, guest_manual jsonb, couple_message jsonb,
                 gallery jsonb, rsvp_deadline, allow_plus_ones,
                 enable_music, enable_qr_validation, created_at)
guests          (id, event_id → events, name, salutation_type, custom_salutation,
                 relationship, phone, token UNIQUE, max_guests,
                 confirmed_guests, rsvp_status, rsvp_date, rsvp_notes,
                 dietary_restrictions, accessed_at, access_count,
                 qr_status, qr_scanned_at, qr_scanned_by)
platform_settings (id=1, brand_name, support_email, support_phone,
                   payment_iban?, payment_mcx_phone?, payment_holder_name?)
payment_requests (id uuid PK, couple_id → couples, plan, kind, amount_kz,
                  reference UNIQUE, status, created_at, paid_at?,
                  confirmed_by?, notes?)   -- pedidos de pagamento (Fase 0)
rsvp_events     (opcional — auditoria de respostas/alterações)
```

### 9.3 Políticas RLS (esquema)

| Tabela | `admin` | `cliente` | `convidado`/público |
|--------|---------|-----------|---------------------|
| `profiles` | CRUD total | SELECT do próprio | — |
| `couples` | CRUD | SELECT/UPDATE do próprio* | — |
| `events` | CRUD | SELECT/UPDATE **apenas** `couple_id = sessão.couple_id` | SELECT apenas `status='active'` (via RPC pública) |
| `guests` | CRUD | CRUD apenas dos eventos do casal | — (acesso por RPC com token) |
| `platform_settings` | CRUD | SELECT | — |
| `payment_requests` | CRUD total (confirmação/cancelamento auditados) | SELECT + INSERT dos próprios (apenas `status='pending'`) | — |

> *Trigger `enforce_couples_commercial_guard` (migração payment_requests): o UPDATE do
> casal não pode mudar `payment_status`, não pode elevar `plan` (só manter/descer) e
> `pending_plan` só pode ser NULL ou um nível superior — fecha a lacuna de auto-confirmação.
> O frontend nunca confia no `coupleId` do cliente: o RLS usa `auth.uid()` → `profiles` → `couples`.

### 9.4 RPCs públicas (security definer, sem sessão)

```
resolve_invitation(slug, token)      → dados públicos do evento + convidado
                                       (regista access_count, nunca devolve password)
submit_rsvp(token, status, notes…)   → grava RSVP + data (apenas eventos active)
validate_qr(token)                   → estado do passe + marca 'used'
```

### 9.5 Storage (fotos)

**Cliente (sempre):** o cliente envia as próprias fotos em `ClientDadosPage` ("As nossas fotos").
`src/utils/imageUpload.ts` valida (JPG/PNG/WEBP, máx. 10 MB), redimensiona (maior lado 1600 px) e
comprime em JPEG ~0.82 no próprio navegador (chega ao formulário como `dataURL` intermédio).
Limite de galeria por plano em `PLAN_GALLERY_LIMIT` (Essencial 6 / Pro 20) — o botão "Adicionar" some
ao atingir o limite. Sem `heroPhoto`, o arco do convite cai para um bloco tipográfico (`CoupleHeroSection`).
Migração `migrateLegacyPhotos()` em `weddingStorage.init()` corrige URLs de assets renomeados.

**Fase 2 (Supabase) — activo (Issue #32):** as fotos vivem no bucket `event-photos`, pasta
`couples/<casal>/<evento>/` (`hero.jpg`, `intimate.jpg`, `rings.jpg`, `gallery-<id>.jpg`).
`supabaseRepository.saveEvent` envia os `dataURL` pendentes ao bucket (funções de `storage.ts`) e a
linha do evento guarda **só o caminho**; na leitura `resolveEventPhotos()` converte caminho → URL
pública (`getPublicUrl`, síncrona, sem rede) — `dataURL`/URLs antigas passam intactas, pelo que
convites já publicados continuam a abrir sem migração. Escrita protegida por RLS
(`event_photos_owner_*`: casal dono ou admin), leitura pública (bucket `public=true`; caminhos com
UUIDs de casal+evento não são enumeráveis — ver migração
`20261013090000_event_photos_public_bucket.sql`). Fotos substituídas/removidas e pastas de eventos
apagados são limpos do bucket (best-effort, nunca bloqueiam o guardado).

### 9.6 Migração — plano executado (Issue A #28 · Issue B #29)

**Decisões adoptadas:**
- **Assíncrono, sem React Query** — `WeddingRepository` com `await` simples + `useState`/`useEffect`;
  skeletons/estados de loading já existentes. Menos dependência, mesma garantia.
- **Auth por email + palavra-passe** para o cliente; a palavra-passe Supabase é o **telefone em E.164**
  (`phoneAsPassword`: dígitos, `00`→removido, `9xxxxxxxx`→`244…`, prefixo `+`). Admin usa password forte.
- **Autoconfirm bloqueado** (`mailer_autoconfirm=False` e config da Management API bloqueada) →
  trigger `handle_new_user` cria casal+evento+slug+`profiles.couple_id` **no momento do `signUp`**
  a partir dos metadados (`aura_name`, `aura_phone`, `aura_occasion`, `aura_plan`). Consequência UX:
  registo → email de confirmação → login (ecrã "Quase lá!").
- **Convidado continua sem conta**; RSVP e QR validados por token via RPCs `submit_rsvp`/`validate_qr`.
- **Base limpa** — dados demo removidos; Gabriel recriado manualmente; links de demonstração retirados.
- **Fotos** vão para o bucket `event-photos` e a linha guarda só o caminho (Issue #32 — ver §9.5).

**RPCs (migrations `…_align_app_types.sql` e `…_invitation_public_access.sql`):**
`register_client` (authenticated), `submit_rsvp`, `validate_qr`, `resolve_invitation` (anon, devolve
`{ok, event, guest, couple_status}`, regista acesso, só `status='active'`).

> **Efeito lateral aceite:** convites `suspended`/`draft` vistos por anónimos em produção mostram
> "Convite Não Encontrado" (a RPC só devolve activos) em vez de "Indisponível" — mais privado.
> No modo local a página aplica os gates de estado ela própria (defesa em profundidade).

---

## 10. Segurança

- **Convidado = token único** por convidado (`generateRandomToken`), intransmissível; nunca enumeração de IDs.
- RSVP e check-in **sem sessão**, validados por token + estado do evento.
- Guards frontend são espelho; **RLS é a barreira real** (secção 9.3).
- QR gerado localmente (`qrcode`) — sem chamadas a serviços de terceiros.
- Credenciais demo são apenas para apresentação e vivem no repo de forma explícita.
- Importar PDFs de referência (Fase 2 de design) **nunca** como base de URLs ou segredos no código.

---

## 11. Pendências / próximos passos

| # | Item | Estado |
|---|------|--------|
| 1 | Sitemap + separação das 4 áreas | ✅ |
| 2 | Guards de rota (espelho de RLS) | ✅ |
| 3 | Cadeia demo completa (admin → cliente → convidado → RSVP → QR) | ✅ testada |
| 4 | `docs/ARQUITECTURA.md` (este documento) | ✅ |
| 5 | **F1–F8 — funil auto-serviço + 4 ocasiões + gate de pagamento** (plano aprovado) | ✅ lint + build + Playwright 3010 |
| 5.1 | F7 admin: ocasião nas listas, password opcional, "Confirmar pagamento" | ✅ validado |
| 5.2 | F6 convite: rótulos/visibilidade por ocasião + migração de eventos antigos | ✅ validado |
| 5.3 | Fix: `?plano=pro` em `/criar` era ignorado no registo (passava sempre `essential`) | ✅ corrigido + testado |
| 5.4 | **Fotos** — upload pelo cliente (hero + galeria com legendas, limite por plano, fallback do arco sem foto) + substituição dos assets de casal branco (landing/convites) por fotos de casal negro com migração de URLs antigos | ✅ lint + build + Playwright 3010 |
| 5.5 | **RSVP completo** — contagem decrescente para o prazo, acompanhantes nomeados (cada nome = 1 lugar, cap `maxGuests`) e grupo Noiva/Noivo (opções por ocasião, vazio esconde o campo); gravado em `companions`/`group` do convidado e visível nas listas admin/cliente + CSV | ✅ lint + build + Playwright 3010 |
| 6 | Fase 2 de design — PDFs de referência (pasta fornecida pelo utilizador) | ⏳ por receber |
| 7 | Supabase: schema + RLS + auth + RPCs (secção 9) | ✅ Issue A #28 + Issue B #29 (corte de produção) |
| 8 | Testes automatizados (unit + fluxo RSVP/check-in) | ✅ Vitest + CI em cada PR (Issue #5 · PR #15 · 59 testes) |
| 9 | Code-splitting (bundle actual ~592 kB) | ✅ rotas em `React.lazy` + chunk por página (~345 kB) |
| 10 | Nota menor: dashboard admin duplica nome do evento/cliente na tabela de eventos | ⏳ cosmético |
| 11 | Limpeza de deps sem uso + lock file único + docs actualizadas | ✅ Issue #16 |
| 12 | Fotos via Storage `event-photos` (§9.5) — evitar base64 nas linhas do evento | ✅ Issue #32 |
| 13 | Recuperação de palavra-passe (o cliente só tem a palavra-passe=telefone) | ✅ Issue #31 · PR #38 |
| 14 | Activar *leaked password protection* + rotação das chaves expostas durante a migração | ⏳ operação Supabase/GitHub/Vercel |
