# Aura Nupcial

Plataforma de **convites digitais para grandes ocasiões** (casamento, noivado, aniversário e outras celebrações) — com RSVP em tempo real, links individuais por convidado e check-in por QR Code no dia do evento.

**Site no ar:** https://suedjosue-svg.github.io/aura-nupcial/

**Documentação:**

| Documento | Para quem | Conteúdo |
|---|---|---|
| [`docs/COMO-FUNCIONA.md`](docs/COMO-FUNCIONA.md) | Investidores / não técnicos | O produto, o fluxo, o modelo de negócio, o que está pronto e o que falta |
| [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) | Equipa técnica | Rotas, permissões, modelo de dados, segurança, plano Supabase |
| [`docs/ANALISE-INVITESAO.md`](docs/ANALISE-INVITESAO.md) | Equipa | Análise da concorrência e plano priorizado de melhorias |

---

## Correr localmente

**Pré-requisito:** Node.js 22+

```bash
npm install      # dependências
npm run dev      # servidor de desenvolvimento em http://localhost:3000
npm run lint     # verificação de tipos — OBRIGATÓRIO após cada alteração
npm test         # testes automatizados (Vitest) — 59 testes
npm run build    # build de produção (gera dist/ e 404.html)
```

Não é necessária nenhuma chave de API para correr o projecto.

---

## Fluxo de trabalho — Issues, PRs e deploys

> **Regra de ouro: nada entra em `main` sem passar por uma Issue e um Pull Request.**
> Este padrão vale para humanos e para **qualquer agente de IA, de qualquer modelo**.

### 1. Toda a tarefa começa numa Issue

- Correcção, melhoria ou nova função → **uma Issue por tarefa**, sempre com o tipo em título e label.
- Labels obrigatórias (escolher **uma**):

  | Label | Quando usar |
  |---|---|
  | `correcao` | Algo está errado ou partido |
  | `melhoria` | Melhorar o que já existe (qualidade, desempenho, UX) |
  | `nova-funcao` | Funcionalidade que ainda não existe |

- Usar o template de Issue (`.github/ISSUE_TEMPLATE/`), que já pede o tipo, a descrição e os critérios de aceite.

### 2. Trabalho numa branch, nunca directamente em `main`

```bash
git checkout main && git pull
git checkout -b issue/<n>-<slug>     # ex.: issue/3-duplica-nome-dashboard
# … alterações …
npm run lint                          # obrigatório antes de entregar
git commit -m "breve descrição"
git push -u origin issue/<n>-<slug>
```

### 3. Pull Request que **menciona a Issue**

- Abrir o PR a partir da branch da issue, com o template (`.github/PULL_REQUEST_TEMPLATE.md`).
- **A descrição do PR tem de referenciar a Issue** com `Closes #<n>` (ou `Fixes`/`Resolves`) — assim o GitHub fecha a Issue sozinho no merge.
- O PR deve dizer: o que mudou, porquê e como foi testado.

### 4. Merge = deploy

- O deploy é automático: o workflow **Deploy to GitHub Pages** (`.github/workflows/deploy.yml`) corre em cada **merge em `main`**.
- Por isso **não fazer `git push` directo para `main`** — isso dispararia um deploy sem revisão.
- Deploy falhou? Ver acções em https://github.com/suedjosue-svg/aura-nupcial/actions

### 5. Checklist antes do merge

- [ ] Issue correspondente existe e está linkada (`Closes #n`)
- [ ] `npm run lint` passa
- [ ] `npm test` passa (também corre sozinho no CI de cada PR)
- [ ] `npm run build` passa
- [ ] Teste manual do que mudou (dev server)
- [ ] Sem secrets, chaves ou `.env` no diff

---

## Estrutura do repositório

```
docs/                    documentação (COMO-FUNCIONA, ARQUITECTURA, ANALISE-INVITESAO)
src/
├── app/                 router, sessão e guarda de rotas
├── layouts/             4 ambientes: público, admin, cliente, convite
├── routes/              páginas de cada ambiente
├── components/          secções do convite e componentes comuns
├── services/            persistência de dados, RSVP, QR, onboarding
└── data/                dados de demonstração, ocasiões, temas
.github/
├── ISSUE_TEMPLATE/      modelos de issue (correção / melhoria / nova função)
├── PULL_REQUEST_TEMPLATE.md
└── workflows/deploy.yml deploy automático em cada merge em main
```
