# Análise — InvitesAO (invitesao.com) vs Aura Nupcial

> **Data da análise:** 05-10-2026
> **Método:** Playwright (percurso real de utilizador) + webfetch + leitura directa da API pública deles.
> **Ferramentas:** apenas Playwright + webfetch (ScrapeGraphAI **não** usado — ver nota no final).
> **Âmbito:** site público + convite de demonstração. Áreas autenticadas deles não foram invadidas nem submetidas — nenhum RSVP, registo ou compra foi enviado.

---

## 1. Sumário executivo

A **InvitesAO** (marca da AdKira, Viana — Luanda Sul, Angola) é um **SPA único** (uma página, todos os ecrãs no DOM) com backend **Supabase atrás de um Cloudflare Worker** próprio. O produto é um **mercado de convites digitais multi-evento** (casamento, noivado, aniversário) com **catálogo de modelos prontos baratos** (4 500–5 500 Kz) e **serviço personalizado por pacotes** (35 000–99 999+ Kz), vendido com **onboarding manual** (transferência → comprovativo → código de acesso `ADKIRA-XXXX-XXXX`).

**Pontos fortes deles:** prova social agressiva ("N compras"), catálogo visual com preço unitário, RSVP com acompanhantes dinâmicos, convite em modo **poster/PDF** pixel-perfect com hotspots (RSVP, presentes, FAQ, vídeo, contagem decrescente), personalização por nome de convidado cobrada à parte (70 Kz/nome).

**Pontos fracos verificados (05-10-2026)** — todos confirmados com evidência:

1. **Links `?event=CODIGO` estão quebrados** para visitantes anónimos (`Evento não encontrado` → `/api/events/null` 404 → "Página não encontrada"), verificado 2× em navegador limpo.
2. **Busca de código na home também falha** (a lista `/api/events` exige sessão → 401 → redirect).
3. **FAQ público vazio** (`/api/table/faq` → `{"rows":[]}`).
4. **Preços inconsistentes:** a página `/precos` mostra 99 999/159 999/219 999 Kz, o funil vivo (`sales_catalog`) cobra 35 000/60 000/99 999 + por convite.
5. **Privacidade:** a busca de eventos carrega **todos os eventos + todos os RSVPs** para a máquina do visitante e filtra no cliente.
6. **Convite renderizado em `<canvas>`** — zero texto semântico (SEO, acessibilidade, copiar morada: nada disso funciona no convite).
7. **Ecrã de conta deles ("Utilizador / Conta Standard / Sair da Conta") presente no DOM da página do convidado.**
8. **Links legais e sociais = `#`** (placeholders); watermark do concorrente com telefone no rodapé do convite.

**Consequência para a Aura:** a Fase 1 da Aura já está numa posição **técnica superior** em separação de ambientes, semântica/SEO do convite e arquitectura prevista para RLS. As lacunas da Aura são de **catálogo/comercial** (modelos prontos, Save-the-Date, presentes, dress code, vídeo, prova social) — todos cobríveis com quick wins públicos + Fase 2 Supabase (ver §8).

---

## 2. Quem são (posicionamento)

| Item | Observação |
|------|-----------|
| Marca | **InvitesAO** (headline usa "Convites digitais para o teu grande dia") |
| Empresa | **AdKira** (footer: Viana, Luanda Sul — Angola) |
| Canal de venda | WhatsApp **959 823 409** (aparece no watermark do convite e no suporte) |
| Alcance | Multi-evento: casamento, noivado, aniversário infantil, aniversário adulto |
| Idioma | pt-AO/pt-PT, Kwanza (Kz) |
| Redes | WhatsApp, Instagram, Facebook, TikTok, Pinterest, YouTube (ícones no footer; muitos apontam para `#`) |

**Tom:** comercial/viral, orientado a conversão barata ("🔥 N compras", preços por convite, modelos "prontos em 2 minutos"). Não é premium-editorial — é volume.

---

## 3. Arquitectura técnica observada

```
invitesao.com  (SPA — index.html com TODOS os ecrãs no DOM)
   │  screen-home · screen-pricing · screen-model-catalog · screen-guest · screen-admin …
   │  gating apenas client-side (o admin existe no DOM para anónimos)
   │
   └──► https://invitesao-api.araujocataca16.workers.dev/api   ← Cloudflare Worker (proxy Supabase)
          │  PostgREST-style: /events/{code} · /events?… · /rsvps · /auth/me · /auth/refresh
          │  /table/site_config · /table/faq · /table/fonts · /catalog/models
          │  /site-settings/sales_catalog   (preços/vigência — fonte de verdade comercial)
          │  /storage/v1/object/public/…    (PDFs de convite, galerias, vídeos)
          └──► Supabase (URL mascarada: SUPABASE_URL = WORKER_URL, ANON_KEY = 'unused-legacy-compat')
```

- `GET /api/events/{event_code}` é **público** (devolve evento completo, ex.: `7ZGY3ZBY` → 200).
- `GET /api/events?…` (lista) **exige sessão** → 401 `UNAUTHENTICATED` — daí a busca pública estar partida.
- Duplicar a barra no URL (`/api//events`) devolve `ROUTE_NOT_FOUND`.
- Sessão: `auth/me` + `auth/refresh` (401 anónimo, como esperado).

### 3.1 Modelo de dados do evento (146–165 campos por evento!)

Exemplo real (`7V0VYETW` — "Exemplo — Casamento Premium"), campos mais relevantes:

| Grupo | Campos |
|-------|--------|
| Básico | `event_code`, `title`, `date`, `time`, `status`, `expires_at`, `event_color #007f9f`, `is_example_event`, `client_view_token CV-…` |
| Convite em **secções** (modo DOM) | `invite_layout: "sections"`, `show_couple`, `show_bible` (+`bible_size`), `show_invite` (+`invite_text`, `invite_order`, `invite_blessing`), `show_parents`, `show_gallery`, `show_manual`, `show_schedule`, `show_story`, `show_dresscode`, `music_url` (YouTube!) + `music_title`, `bg_overlay`, `button_style`, cores por elemento (`color_names`, `color_countdown`, …) |
| Convite em **PDF/poster** (modo canvas) | `pdf_invite_enabled`, `pdf_invite_url` (ficheiro no storage), e **hotspots posicionados** `x/y/size/page/color/text` para: RSVP (pág. 1), música + contagem (pág. 3), nome do convidado (pág. 3), QR (pág. 3), galeria carrossel (pág. 5, 11 fotos), presentes (pág. 8), FAQ + vídeo (pág. 10) |
| Comportamento | `rsvp_enabled`, `save_the_date_enabled`, `guest_links_enabled`, `allowGifts`, `pdf_invite_std_*` (Save-the-Date do PDF) |
| Embutidos | `rsvps[]`, `gifts[]` devolvidos **junto com o evento** |

**Consequência importante:** dependendo do evento, o convidado vê **ou** um poster interactivo em canvas **ou** uma página DOM com secções. Os eventos públicos de exemplo usam o **modo poster**.

### 3.2 Tabelas conhecidas (por referência/observação)

`events`, `rsvps` (guest_name, attending, side, companions, kids, wants_gift, message, owner_reply, rsvp_token, ticket_issued, checked_in), `gifts`, `guest_links`, `intake_tokens`, `event_visuals`, `event_venues`, `event_dates`, `media_library`, `visit_log`, `lead_inquiries`, `orders`, `accounts` (allowed_features, eventLimit, tickets), `sales_demo_questions` (questionário de venda: cores, Save-the-Date, pais, versículo bíblico…).

---

## 4. Funil público e modelo comercial

### 4.1 Landing (`/`)

- H1: *"Convites digitais para o teu grande dia"*, CTAs **"Ver Pacotes"** / "Entrar".
- **Caixa de código:** *"Já tens código do convite? Pesquisa aqui…"* — **hoje está partida** (§6.2).
- Hero: `assets/site/hero-capa-desktop.webp`; footer AdKira com promoção (contagem regressiva no rodapé).

### 4.2 Pacotes de casamento (`/catalogo/personalizados` → pacote)

Fonte de verdade: `/api/site-settings/sales_catalog` (verificado hoje):

| Pacote | Preço | Notas |
|--------|-------|-------|
| **Simples** | 15 000 Kz (flat) | entrada de gama |
| **Básico** | 35 000 Kz (flat) | |
| **Essencial** | 60 000 Kz + **500 Kz/convite** | ref. evento `J6YCBDQ9`, limites mín. 66 / máx. 99 999 Kz |
| **Premium** | 99 999 Kz + **1 000 Kz/convite** | ref. `7V0VYETW`, máx. 249 000 Kz, inclui **vídeo** |

- Addon **Save-the-Date: 15 000 Kz**; `floorPercentage: 25`; `oldPricingEnabled: false`; `referenceEventCode: 7ZGY3ZBY`.
- Página `/precos` (público) mostra **preços antigos** (99 999 / 159 999 / 219 999 Kz) — **inconsistente com o funil** (§6.4).
- Exemplo de copy de venda: *"O preço final depende do nº de convites"*; itens "incluídos" listados por pacote.

### 4.3 Modelos prontos (`/modelos`)

- Catálogo com preço unitário **4 500–5 500 Kz**, categorias (Casamentos/Noivados/Aniversários/Momentos especiais) e **prova social "🔥 N compras"**.
- Detalhe `/modelos/modelo/tpl-{id}`: preview renderizado, *"Personalização por convidado: Cada nome de convidado inserido no convite custa **70 Kz**, além do preço do modelo"*, botão **"Personalizar este modelo"**.
- Ver `docs/analise-invitesao/modelo-detalhe.png`.

### 4.4 Onboarding do cliente — 100% manual

```
Escolhe pacote → "Aderir a este pacote" → registo
   → paga por transferência e envia COMPROVATIVO (WhatsApp)
   → a AdKira emite código  ADKIRA-XXXX-XXXX
   → cliente entra em /modelos/entrar com o código ("Verificar")
   → desbloqueia o seu evento
```

- Ecrã de acesso: `docs/analise-invitesao/codigo-acesso.png` — *"Insere o código que recebeste depois de enviares o comprovativo."*
- **Sem auto-onboarding, sem pagamento online.** Escala limitada pela equipa humana.

### 4.5 Login (`/entrar`)

- Campos: *Telefone, ID ou E-mail* (`Ex: 912345678`) + *Senha* + *Manter-me conectado*.
- Atalho: *"Compraste um convite na loja? Entra com o teu código de acesso →"*.

---

## 5. Experiência do convidado

### 5.1 Rotas de convite

| Rota | Estado verificado |
|------|-------------------|
| `invitesao.com/{slug}` (ex.: `/modelo-casamento`) | ✅ funciona — convite abre |
| `invitesao.com/?event=CODIGO` | ❌ **partido** para anónimos (§6.1) |
| `invitesao.com/{slug}/convidado/{guest-code}` | link pessoal; `guest_links` + fingerprint de dispositivo (cookie ~400 dias por causa do Safari iOS) — feature **desactivada** nos exemplos (`guest_links_enabled: 0`) |
| Envelope pessoal | Sim — o modelo de RSVP deles identifica o convidado pelo link (whitelist/"portão da lista" com 3 tentativas, visit_log) |

### 5.2 Modo poster (canvas) — como funciona

```
#pi-guest-root
├── #pi-guest-wrap → #pi-guest-pages → .pi-guest-page
│      ├── <canvas class="pi-guest-canvas">   ← convite inteiro desenhado em canvas
│      └── .pi-guest-overlay (inset:0)
│             └── <button> … "Confirmar Presença"  ← hotspot posicionado em % (ex.: top 84.9%)
└── <p> Created by Invites 2026 · WhatsApp: 959 823 409   ← watermark
```

- O viewer desenha o PDF/design numa página única (scrollável, ex.: 1630 px) e **sobrepõe botões-hotspot** ancorados em percentagens.
- RSVP abre um **bottom-sheet** (gaveta) por cima do poster — ver `docs/analise-invitesao/rsvp-drawer.png`.
- **Sem qualquer texto no DOM** — impossível copiar a morada, partilhar via metadados, ou aparecer em pesquisas.

### 5.3 Formulário de RSVP (extraído, **não submetido**)

| Campo | Detalhe |
|-------|---------|
| *Confirma presença?* | rádio **Sim / Não** (pilhas grandes lado a lado) |
| *Seu Nome \** | obrigatório, placeholder "Máx. 3 nomes" |
| *Escolhe o grupo* | rádio **Noivo / Noiva** (lado) |
| *Acompanhantes (opcional)* | input dinâmico "Nome (máx. 3 palavras)" + **"+ Adicionar acompanhante"** (remoção com ✕) |
| *Deixar uma mensagem (opcional)* | textarea "Escreve algo especial…" |
| Acções | **"Enviar Confirmação"** (CTA dourado) · **"Ver Felicitações"** |

Comparado com o RSVP deles no backend: também suporta `kids`, `wants_gift`, `owner_reply` (resposta do casal), `ticket_issued` + `checked_in` (check-in no dia) — ou seja, **eles também têm check-in**, como a Aura.

### 5.4 Experiência nos modelos (`/modelos/modelo/tpl-…`)

Preview **em DOM real** (diferente do convite em canvas): nome dos noivos, "Confirmar Presença", contagem, data/hora, local + **botão Google Maps**, aviso de personalização por nome (70 Kz), preço e CTA "Personalizar este modelo".

---

## 6. Bugs e gaps verificados (05-10-2026)

### 6.1 `?event=CODIGO` quebrado para anónimos — **alto impacto**

```
/?event=J6YCBDQ9  (estado limpo: cookies + storage vazios)
  → [23s] ❌ Evento não encontrado
  → [25s] [EVENTO] não está em Store.events — a ir buscá-lo à API. null
  → GET /api/events/null → 404
  → ecrã "Página não encontrada"
```

Reproduzido 2× (com e sem sessão suja). O fallback `origin/?event=CODE` — que o **próprio código deles** gera quando um evento não tem slug — não resolve. Todos os exemplos públicos (`J6YCBDQ9`, `7V0VYETW`, `QN1OML54`) têm `slug: null`, portanto **os links por código dos pacotes de venda não abrem**.

### 6.2 Busca por código na home quebrada

A home chama `searchEvent()` → `GET /api/events?select=*` → **401** (lista exige sessão) → "Evento não encontrado". O convidado com o código impresso no convite não consegue abrir.

### 6.3 Privacidade — a busca carrega tudo para o cliente

`searchEvent()` descarrega **todos os eventos e todos os RSVPs** e filtra no browser. Mesmo que o endpoint fosse público, estaria a expor RSVPs de todos os casais a qualquer visitante.

### 6.4 Preços `/precos` ≠ `sales_catalog`

`/precos`: 99 999 / 159 999 / 219 999 Kz (antigos, `oldPricingEnabled: false`). Funil vivo: 35 000 / 60 000+500 / 99 999+1 000. Um visitante vê preços diferentes consoante o caminho.

### 6.5 Conteúdo e acabamento

| Gap | Evidência |
|-----|-----------|
| FAQ público vazio | `GET /api/table/faq` → `{"rows":[]}` |
| Links legais/sociais = `#` | Termos, Política, redes no footer |
| Ecrã de conta no DOM do convidado | drawer "Utilizador · Conta Standard · Sair da Conta" |
| Erros de consola | falha ao carregar Tailwind CDN (observado em carga da home) |
| Watermark no convite | "Created by Invites 2026 · WhatsApp: 959 823 409" — fixa a marca deles em cada convite |
| Boot lento | ~19–26 s até resolver o evento no `?event=` (JS + retries + auth/me) |

### 6.6 O que eles têm e a Aura **ainda não** (gaps de produto)

| Funcionalidade | InvitesAO | Aura (Fase 1) |
|----------------|-----------|----------------|
| Modelos prontos com preço unitário + "N compras" | ✅ | só 4 templates atribuíveis |
| Cobrança por nome de convidado personalizado (70 Kz) | ✅ | ❌ |
| Save-the-Date como addon pago | ✅ | secção existe no convite, **sem venda** |
| Secção **Presentes** (`allowGifts`, wishlist no convite) | ✅ | ❌ |
| **Dress code** no convite | ✅ | ❌ |
| **FAQ** dentro do convite | ✅ (hotspot) | só site público |
| **Vídeo** embutido no convite | ✅ (Premium) | ❌ |
| Música YouTube | ✅ (`music_url`) | player próprio (`AudioControl`) ✅ |
| Lado **Noivo/Noiva** no RSVP | ✅ | ❌ (só assentos + dieta + mensagem) |
| Acompanhantes dinâmicos ("+ adicionar") | ✅ | máx. de convidados fixo |
| Expiração automática do evento (`expires_at`) | ✅ | estado manual (`active/suspended`) |
| Contagem/reacções públicas ("Felicitaciones") | ✅ ("Ver Felicitações") | ❌ |
| Check-in QR | ✅ (`checked_in`, `ticket_issued`) | ✅ |
| Galeria, manual, cronograma, versículo, declarações | ✅ | ✅ (mais completos: envelope cinematográfico, QR por convidado) |

### 6.7 O que a Aura tem e eles não

| Vantagem Aura | Detalhe |
|---------------|---------|
| **4 ambientes separados** (público/admin/cliente/convidado) | eles: SPA única, tudo no DOM, gating só client-side |
| **Convite semântico em DOM** (14 secções, acessível, indexável) | eles: canvas sem texto |
| **Envelope de abertura + QR pessoal por convidado** (token) | eles: fingerprint + código de convidado (feature desactivada nos exemplos) |
| **Guia de arquitectura para RLS desde o dia 1** (`docs/ARQUITECTURA.md` §9) | eles: anon key "unused", tudo no cliente |
| Separação admin ↔ cliente ↔ convidado **verificada e testada** | ecrã de conta deles no convite do convidado |
| Sem watermark de terceiros | watermark deles em todos os convites |

---

## 7. Comparação lado a lado

| Dimensão | **Aura Nupcial** (Fase 1) | **InvitesAO** (hoje) |
|----------|---------------------------|----------------------|
| Arquitectura | SPA React multi-área, rotas isoladas | SPA única com todos os ecrãs no DOM |
| Backend | `localStorage` (Fase 2: Supabase + RLS planificado) | Supabase + Worker Cloudflare (já em produção) |
| Público-alvo | Casamento (premium, editorial) | Multi-evento (volume, conversão) |
| Preços (verificados) | Essential **85 000** · Pro **150 000** Kz (flat) | 15 000–99 999+ Kz + por convite; modelos 4 500–5 500 |
| Conversão | `/adquirir` → contacto | Pacote → transferência → código manual |
| Convite | DOM imersivo + envelope + QR por convidado | Canvas/poster com hotspots + watermark |
| RSVP | Sim/Não · assentos · restrições · mensagem | Sim/Não · **lado** · acompanhantes dinâmicos · mensagem · felicitações |
| Prova social | fraca (sem contadores/dependoimentos) | forte ("🔥 N compras", promoções, contagem) |
| FAQ | página própria (conteúdo a escrever) | página **vazia** |
| Privacidade | prevista (RLS Fase 2) | listas inteiras no cliente |
| Estado verificado | ✅ lint + build + percurso manual completo | ❌ 2 fluxos públicos de entrada partidos |

---

## 8. Plano priorizado de melhorias

### 8.1 Quick wins — site público (sem Supabase, imediatos)

| # | Melhoria | Porquê (evidência deles) |
|---|----------|--------------------------|
| 1 | **Prova social real na landing**: contadores (N casamentos publicados, N RSVPs recebidos), 2–3 depoimentos com foto, "usado por" | eles usam "🔥 N compras" em cada modelo — é o gatilho mais visível do funil |
| 2 | **Escrever o FAQ da Aura** (10–12 perguntas: prazo, preço, QR, privacidade, música) | o FAQ deles está **vazio** — vitória fácil e SEO |
| 3 | **Coerência de preços** entre landing, `/pacotes` e `/adquirir` (uma só tabela, "a partir de") | `/precos` deles contradiz o funil — credibilidade |
| 4 | **Páginas legais reais** (Termos, Privacidade, Cookies) | os links deles são `#` |
| 5 | **Galeria de exemplos navegáveis** em `/exemplos` (2–3 convites demo reais com RSVP funcional) | o catálogo de modelos deles é a peça de venda principal; a Aura já tem o convite demo — falta expô-lo |
| 6 | **CTA WhatsApp directo** (botão flutuante + número no footer) no tom "fala connosco" | canal de venda deles por excelência |
| 7 | **Comparativo "papel vs WhatsApp vs Aura"** + "porquê digital" (partilhável, RSVP automático, QR no dia) | nenhum dos dois explica a categoria — conteúdo diferencia |
| 8 | **Teste de performance**: bundle ~557 kB → code-splitting (`React.lazy` nas áreas) | o boot deles demora 19–26 s a resolver o convite — oportunidade de serem "instantâneos" |

### 8.2 Médio prazo — ligado à Fase 2 (Supabase)

| # | Melhoria | Como (alinhado com `ARQUITECTURA.md` §9) |
|---|----------|------------------------------------------|
| 1 | **Catálogo de templates com preço + prova social** (`templates` públicos com `purchases_count`) | tabela `templates` + RPC pública `list_public_templates()` (RLS: só activos) |
| 2 | **Save-the-Date como produto/addon** (lançamento antecipado, contagem) | Aura já tem `SaveTheDateSection` — falta vendê-lo (settings por evento + preço no checkout) |
| 3 | **Secção Presentes** (IBAN/MBWAY/link, `wants_gift` já existe no RSVP deles) | nova tabela `gifts` + secção `GiftsSection` + RPC pública |
| 4 | **Dress code + FAQ + vídeo no convite** | campos `jsonb` em `events` (já previstos no schema) + 3 secções novas |
| 5 | **Lado Noivo/Noiva + acompanhantes dinâmicos no RSVP** | coluna `side` + `companions jsonb` (espelha o modelo deles) |
| 6 | **Expiração automática** (`expires_at`) | job/estado derivado: evento `active` só entre datas (eles já fazem) |
| 7 | **Entrada por código do convidado SEM partir** — busca pública só do evento, nunca listas | RPC `resolve_by_code(code)` (security definer) — **nunca** carregar listas para o cliente (falha #3 deles) |
| 8 | **"Felicitacoes"/recados públicos** após RSVP (ecrã de agradecimento partilhável) | tabela `rsvp_messages` + ecrã pós-envio |
| 9 | **Música YouTube embutida** (além do player próprio) | `enable_music` + `music_url` — 1 campo, 1 embed |
| 10 | **Guard RLS end-to-end** + testes de fluxo (aqui a Aura já define o padrão que eles não cumprem) | `docs/ARQUITECTURA.md` §9.3–9.4 |

### 8.3 Decisões estratégicas (requerem escolha tua)

1. **Modelo de entrada deles vs auto-serviço da Aura.** Eles vendem com transferência + código manual (limita escala, mas controla churn). A Aura pode diferenciar-se com **compra/self-onboarding online** (Fase 2: Stripe/transferência + activação automática) ou manter concierge — decidir antes de construir checkout.
2. **Preços.** Aura (85 000 / 150 000 flat) é **~2× mais caro** que o gama média deles (60 000 base + por convite). Ou o positioning premium é reforçado (prova social + acabamento), ou se adiciona uma **terceira opção de entrada** (ex.: "Essencial Lite" ~45 000 Kz) para não perder o topo de funil.
3. **Modo poster (canvas) — sim ou não.** Eles usam-no para paridade pixel-perfect com PDF. A recomendação é **não copiar**: manter DOM (SEO/acessibilidade/interactividade) e, se necessário no futuro, exportar o convite para PDF partilhável (o inverso do que eles fazem — ganhamos as duas worlds).
4. **Watermark freemium.** Eles monetizam marca no convite. A Aura pode oferecer plano gratuito com watermark Aura (aquisição viral) vs pago sem watermark — só se existir modelo freemium.
5. **ScrapeGraphAI em lote.** Ficou instalado e documentado (`scrapegraph-py` 2.3.1, `SGAI_API_KEY` existe) para **monitorização periódica de preços/páginas deles** — decisão adiada; para uma análise pontual Playwright + webfetch chega (escolha tua, mantida).

---

## 9. Recomendações de posicionamento

1. **"O convite que se lê"** — atacar directamente a fraqueza deles: o convite da Aura é texto real (partilhável, acessível, indexável), não uma imagem. Mensagem: *«No dia do casamento, o teu convite precisa de ser lido — não só visto.»*
2. **Privacidade como diferencial** — «Os RSVPs dos teus convidados nunca saem da tua conta» (eles descarregam tudo para qualquer visitante).
3. **Sem watermark, sem marca de terceiros** no convite dos noivos (eles imprimem "Created by Invites · WhatsApp 9…" em todos).
4. **Categoria casamento puro** — eles são um marketplace multi-evento; a Aura pode ser especialista (tom editorial, versículo, manual do convidado, envelope).
5. **Prova social desde já** — sem ela, os quick wins do §8.1 perdem metade do efeito.

---

## 10. Anexos — evidências

| Ficheiro | Conteúdo |
|----------|----------|
| `docs/analise-invitesao/convite-demo-hero.png` | Convite demo (`/modelo-casamento`) — hero "SAVE THE DATE" (poster em canvas) |
| `docs/analise-invitesao/rsvp-drawer.png` | Gaveta RSVP completa (Sim/Não, nome, lado, acompanhantes, mensagem) |
| `docs/analise-invitesao/modelo-detalhe.png` | Página de detalhe de modelo (preço, personalização 70 Kz, CTA) |
| `docs/analise-invitesao/codigo-acesso.png` | Ecrã de código de acesso (`/modelos/entrar`, `ADKIRA-XXXX-XXXX`) |
| `.playwright-mcp/` | Snapshots YAML + logs de consola das sessões de análise (temporários) |

**Endpoints públicos úteis (verificados 05-10-2026):**

```
GET https://invitesao-api.araujocataca16.workers.dev/api/events/7ZGY3ZBY   → 200 (evento de exemplo)
GET …/api/site-settings/sales_catalog                                      → preços vigentes
GET …/api/catalog/models                                                   → modelos
GET …/api/table/faq                                                        → {"rows":[]}  ← vazio
GET …/api/events?select=*                                                  → 401 (lista exige sessão)
```

**Nota metodológica:** o ScrapeGraphAI (SDK `scrapegraph-py` 2.3.1 já instalado) ficou **por usar** por decisão de avançar com ferramentas grátis (Playwright + webfetch). O `SGAI_API_KEY` continua disponível se, mais tarde, se quiser **monitorização automática em lote** dos preços/páginas deles (§8.3-5).
