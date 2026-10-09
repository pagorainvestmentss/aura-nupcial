import { expect, test, type Page } from '@playwright/test';

/**
 * E2E do 4.º ambiente (CONVIDADO) — abre o convite por token,
 * responde ao RSVP e verifica prazos/gates com localStorage real.
 */

const SLUG = 'mariana-pedro';
const TOKEN = 'anaclara-7Tx9Q';
const EVENTO_ID = 'event-mariana-pedro-2027';
const KEY_EVENTOS = 'aura_events_v2';
const KEY_CONVIDADOS = 'aura_guests_v2';

async function abrirConvite(page: Page) {
  await page.goto(`/convite/${SLUG}/${TOKEN}`);
}

async function pularEnvelope(page: Page) {
  await page.getByRole('button', { name: 'Pular abertura e ver convite direto' }).click();
}

/** Primeira visita que força o seed do localStorage. */
async function semear(page: Page) {
  await abrirConvite(page);
  await page.waitForFunction((chave) => localStorage.getItem(chave) !== null, KEY_EVENTOS);
}

function lerAcessos(page: Page) {
  return page.evaluate(
    ({ chave, token }) => {
      const convidados = JSON.parse(localStorage.getItem(chave) ?? '[]') as Array<{
        token: string;
        accessCount: number;
      }>;
      return convidados.find((c) => c.token === token)?.accessCount ?? 0;
    },
    { chave: KEY_CONVIDADOS, token: TOKEN }
  );
}

test('convidado confirma presença no RSVP e a resposta persiste', async ({ page }) => {
  await abrirConvite(page);
  await expect(page.getByText('Para Ana Clara')).toBeVisible();
  await pularEnvelope(page);

  await page.getByRole('button', { name: /Sim, Estarei Presente/ }).click();
  await expect(page.getByRole('heading', { name: 'Presença Confirmada' })).toBeVisible();

  await page.reload();
  await pularEnvelope(page);
  await expect(page.getByRole('heading', { name: 'Presença Confirmada' })).toBeVisible();
});

test('prazo de resposta passado fecha o formulário de RSVP', async ({ page }) => {
  await semear(page);
  await page.evaluate(
    ({ chave, eventoId }) => {
      const eventos = JSON.parse(localStorage.getItem(chave) ?? '[]') as Array<{
        id: string;
        rsvpDeadline?: string;
      }>;
      const evento = eventos.find((e) => e.id === eventoId);
      if (evento) evento.rsvpDeadline = '2020-01-01';
      localStorage.setItem(chave, JSON.stringify(eventos));
    },
    { chave: KEY_EVENTOS, eventoId: EVENTO_ID }
  );
  await page.reload();
  await pularEnvelope(page);

  await expect(page.getByRole('heading', { name: 'Prazo de Resposta Encerrado' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Sim, Estarei Presente/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Infelizmente Não Poderei/ })).toHaveCount(0);
});

test('convite suspenso bloqueia o acesso e não conta abertura', async ({ page }) => {
  await semear(page);
  await expect(page.getByRole('button', { name: 'Pular abertura e ver convite direto' })).toBeVisible();
  const acessosAntes = await lerAcessos(page);

  await page.evaluate(
    ({ chave, eventoId }) => {
      const eventos = JSON.parse(localStorage.getItem(chave) ?? '[]') as Array<{
        id: string;
        status?: string;
      }>;
      const evento = eventos.find((e) => e.id === eventoId);
      if (evento) evento.status = 'suspended';
      localStorage.setItem(chave, JSON.stringify(eventos));
    },
    { chave: KEY_EVENTOS, eventoId: EVENTO_ID }
  );
  await page.reload();

  await expect(page.getByRole('heading', { name: 'Convite Indisponível' })).toBeVisible();
  expect(await lerAcessos(page)).toBe(acessosAntes);
});
