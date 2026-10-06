# Aura Nupcial — Como funciona

> Documento para leitura não técnica. Explica o produto, o fluxo completo e o estado actual do projecto.
> Para a versão técnica (rotas, modelo de dados, segurança), ver [`ARQUITECTURA.md`](./ARQUITECTURA.md).

**Site no ar:** https://suedjosue-svg.github.io/aura-nupcial/

---

## 1. O que é a Aura Nupcial

A Aura Nupcial é uma plataforma angolana de **convites digitais para grandes ocasiões** — casamento, noivado, aniversário e outras celebrações.

O casal (ou anfitrião) cria a sua conta, preenche os dados do evento, adiciona os convidados e recebe um convite bonito, publicado num endereço próprio. Cada convidado recebe um **link pessoal com o nome dele**, confirma a presença em segundos pelo telemóvel e recebe um QR Code de acesso para o dia do evento.

Tudo acontece no navegador — **sem app para instalar**, sem papel, sem folha de cálculo a circular por WhatsApp.

---

## 2. O problema e a solução

| Hoje (sem a plataforma) | Com a Aura Nupcial |
|---|---|
| Convite impresso, caro e com prazo de entrega | Convite digital pronto em minutos |
| Confirmações recolhidas em 20 conversas de WhatsApp | RSVP reunido num painel, em tempo real |
| Lista de presentes e números de convidados em papel | Lista sempre actualizada, exportável para Excel |
| No dia: quem chegou? quem faltou? | Check-in por QR Code, validado à entrada |
| Sem prova de quem abriu o convite | Cada abertura e resposta fica registada |

A proposta é simples: **o convite deixa de ser um papel descartável e passa a ser um canal de gestão do evento.**

---

## 3. Quem usa a plataforma

A plataforma tem quatro espaços, completamente separados. Cada pessoa vê apenas o que lhe diz respeito.

| Quem | O que tem | O que faz |
|---|---|---|
| **Visitante** | Site público | Conhece a marca, vê exemplos, compara pacotes, cria conta |
| **Casal / anfitrião** | Painel simples e acolhedor | Edita o convite, gère convidados, vê confirmações e relatórios |
| **Convidado** | Apenas um link | Abre o convite, responde (RSVP), guarda o QR Code — **sem registo, sem password** |
| **Equipe Aura Nupcial** | Painel administrativo | Gere clientes, confirma pagamentos, publica eventos, valida QR à entrada |

Regra de ouro do produto: **o convidado nunca vê menus, painéis ou palavras técnicas.** Ele abre o link e o convite aparece.

---

## 4. Como funciona, passo a passo

**01 — Crie a sua conta**
Escolhe a ocasião (casamento, noivado, aniversário ou outra celebração) e regista-se com email e WhatsApp. A plataforma prepara o convite na hora.

**02 — Escolha o pacote**
Essential (até 80 convidados) ou Pro (ilimitado, com QR Code e música). O pagamento é único e confirmado pela nossa equipa.

**03 — Preencha os dados**
No seu painel, edita nomes, data, locais, horários, versículo, cronograma, declarações, fotos e mensagem final — cada campo tem um exemplo à vista.

**04 — Adicione os convidados**
Cada convidado recebe um link individual e intransmissível com o seu nome. O envio é feito directamente por WhatsApp, a partir do painel.

**05 — Publique o convite**
Depois de o pagamento confirmado, o casal pode pré-visualizar o convite como o convidado veria e publicar. Em minutos, está pronto a partilhar.

**06 — RSVP e check-in**
As confirmações chegam em tempo real para o painel (com acompanhantes, grupos e restrições alimentares). No dia do evento, cada convidado é validado por QR Code à entrada.

---

## 5. O que o convidado vive

1. Recebe por WhatsApp um link com **o nome dele** escrito (ex.: *"Para João Manuel"*).
2. Abre num envelope animado e clica em **Abrir convite**.
3. Vê o convite completo: monograma, versículo, locais e horários, cronograma, fotos, declarações e manual do convidado.
4. Responde ao RSVP: vai, não vai, quantas pessoas o acompanham, restrições alimentares.
5. Recebe o seu **QR Code pessoal** — o passe de entrada do dia do evento.

Sem contas, sem passwords, sem descarregar nada. Se o link não for válido ou o evento estiver suspenso, o convidado vê apenas uma mensagem de indisponibilidade.

---

## 6. Modelo de negócio

Preço fixo, **pagamento único** (sem subscrições), confirmado manualmente pela equipa antes de o convite ser publicado.

| | **Essential** | **Pro** (mais escolhido) |
|---|---|---|
| Preço | **85.000 Kz** | **150.000 Kz** |
| Convidados | Até 80 | Ilimitados |
| Links individuais intransmissíveis | ✅ | ✅ |
| RSVP em tempo real | ✅ | ✅ |
| Cronograma, versículo e galeria | ✅ | ✅ |
| Envio por WhatsApp | ✅ | ✅ |
| QR Code de check-in no dia | — | ✅ |
| Manual do convidado e declarações | — | ✅ |
| Música ambiente no convite | — | ✅ |
| Até 3 revisões de design | — | ✅ |
| Suporte prioritário WhatsApp | — | ✅ |
| Relatório de confirmações exportável | — | ✅ |

**Fluxo de receita:** visitante compara no site → cria conta → escolhe pacote → paga → equipa confirma → convite é publicado → cliente é entregue.

A supervisão é da equipa Aura: é a equipa que confirma o pagamento, publica, suspende ou edita qualquer evento da plataforma.

---

## 7. O que já está pronto e a funcionar (Fase 1)

- [x] Site público completo: landing, exemplos, pacotes, FAQ, contacto e criação de conta
- [x] Quatro ocasiões suportadas: casamento, noivado, aniversário e outra celebração (a mesma estrutura, com textos e rótulos próprios de cada uma)
- [x] Painel do casal: editar dados, gestão de convidados, confirmações e pré-visualização
- [x] Painel administrativo: clientes, eventos, convidados, RSVP, templates, pagamentos, relatórios e definições
- [x] Convite do convidado: envelope, RSVP completo (acompanhantes, grupos, restrições, contagem decrescente) e QR pessoal
- [x] Check-in por QR Code no dia do evento
- [x] RSVP em tempo real, visível ao mesmo tempo nos painéis do casal e da administração
- [x] Exportação de listas e relatórios para CSV (Excel)
- [x] 4 temas visuais (Botanical Sage, Elegance Terracotta, Classic Gold, Romance Rose)
- [x] Upload de fotos pelo próprio cliente (foto principal + galeria, com limite por plano)
- [x] Envio directo dos links por WhatsApp e geração de QR local (sem serviços externos)
- [x] Publicação condicionada à confirmação de pagamento

---

## 8. O que falta para receber clientes reais (Fase 2)

A Fase 1 é uma **demonstração completa e navegável**: todos os ecrãs funcionam, mas os dados ficam guardados no navegador de quem está a usar. Traduzido para linguagem de negócio:

| Hoje (Fase 1) | Falta (Fase 2) |
|---|---|
| Cada navegador guarda a sua própria cópia dos dados — as respostas de um convidado não chegam ao casal | **Banco de dados em servidor**, para que todas as pessoas vejam os mesmos dados, em qualquer dispositivo |
| Contas de demonstração fixas | **Contas reais e seguras**, cada cliente com o seu acesso |
| Fotos limitadas pelo espaço do navegador | **Galeria ilimitada** em armazenamento próprio |
| Pagamento confirmado manualmente | **Pagamentos online** integrados e confirmação automática |
| Dados de teste | **Privacidade real**: cada casal vê apenas o seu evento, protegido do lado do servidor |

Está tudo desenhado e documentado — a migração é um passo de engenharia planeado, não uma reescrita do produto. Enquanto isso, **tudo o que está na lista da secção 7 já pode ser testado hoje.**

---

## 9. Como testar agora

**Link público:** https://suedjosue-svg.github.io/aura-nupcial/

**Acessos de demonstração** (botão *Acesso rápido de demonstração* na página de login, em `Entrar`):

| Perfil | Acesso | Password |
|---|---|---|
| Administração da plataforma | `admin@auranupcial.com` | `admin123` |
| Casal (cliente) | `mariana.pedro@auranupcial.com` | sem password (só email) |

**Convite de demonstração (visão do convidado):**
`https://suedjosue-svg.github.io/aura-nupcial/convite/mariana-pedro/8Fk92KsP`

> Os dados guardados durante o teste vivem apenas no navegador de quem testa. Para recomeçar do zero, existe em **Admin → Configurações** a opção *Repor dados de demonstração*.

---

## 10. Próximos passos

1. Teste da equipa à plataforma no seu estado actual (link acima).
2. Recolha de comentários, correções e pedidos de melhoria.
3. Fase 2: servidor, contas reais e dados partilhados — o que permite aceitar clientes pagantes.
4. Fase 2 de design: refinamento visual com os materiais de referência.
5. Arranque comercial: primeiros clientes reais pelo funil que já existe no site.
