# AGENTS.md — Regras de trabalho neste repositório

> Valem para **qualquer agente, de qualquer modelo**. Projecto: Aura Nupcial
> (leia `README.md` para o fluxo completo e `docs/ARQUITECTURA.md` para a arquitectura).

## Fluxo obrigatório: Issue → branch → PR → merge (deploy)

1. **Toda a tarefa nasce numa Issue no GitHub** — correcção, melhoria ou nova função.
   - Label obrigatória: `correcao` | `melhoria` | `nova-funcao`.
   - Uma tarefa = uma Issue. Nunca trabalhar "em silêncio" sem Issue.
2. **Nunca fazer `git push` directo para `main`.**
   - Branch por issue: `issue/<n>-<slug>` (ex.: `issue/3-duplica-nome-dashboard`).
3. **Cada entrega é um Pull Request** com a Issue mencionada na descrição:
   - Primeira linha: `Closes #<n>` (isso fecha a Issue no merge).
   - Usar o template `.github/PULL_REQUEST_TEMPLATE.md`.
   - Descrever: o que mudou, porquê, como foi testado.
4. **O merge em `main` dispara o deploy** (GitHub Pages, `.github/workflows/deploy.yml`).
   - Por isso o PR é o único caminho para produção.

## Antes de abrir o PR

```bash
npm run lint     # tsc --noEmit — obrigatório
npm test         # Vitest — obrigatório se mexeu em lógica
npm run build    # deve passar sem erros
```

- Testar manualmente o que mudou (`npm run dev`, http://localhost:3000).
- Nunca incluir secrets, chaves ou ficheiros `.env` no diff.
- Commits em português, descritivos, sem pontos finais no fim.

## Convenções do código

- **PT-PT** em toda a interface e textos visíveis ao utilizador.
- Stack: Vite 8 + React 19 + TypeScript + Tailwind 4 + `react-router-dom`.
- Alias `@` → raiz do projecto.
- Os 4 ambientes (público, admin, cliente, convidado) **nunca se misturam** — ver `docs/ARQUITECTURA.md`, secção 1.
- Persistência actual: `localStorage` (Fase 1). A camada de dados está isolada em `src/services/weddingStorage.ts` — a Fase 2 (Supabase) troca essa camada; atenção: as assinaturas actuais são **síncronas** e o Supabase é **async** (decisão registada em `docs/ARQUITECTURA.md` §9.6).
- Palavras técnicas (token, API, endpoint) **nunca** aparecem na UI do cliente ou do convidado.

## Referências rápidas

| Preciso de… | Ler |
|---|---|
| Regras do fluxo (versão longa) | `README.md` |
| Arquitectura, rotas, dados, segurança | `docs/ARQUITECTURA.md` |
| Visão de produto (não técnica) | `docs/COMO-FUNCIONA.md` |
| O que está pendente | Issues abertas + `docs/ARQUITECTURA.md` secção 11 |
| Comandos | `npm run dev` · `npm run lint` · `npm test` · `npm run build` |
