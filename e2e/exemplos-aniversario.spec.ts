import { expect, test, type Page } from '@playwright/test';

/**
 * E2E das duas mudanças desta issue:
 *  1. /exemplos — os cartões são clicáveis e abrem os convites de demonstração.
 *  2. Ocasião aniversário — o formulário tem "Quantos anos" e o convite mostra
 *     a idade no topo e no cartão impresso.
 */

const SLUG = 'mariana-pedro';
const TOKEN = '8Fk92KsP';
const EVENTO_ID = 'event-mariana-pedro-2027';
const KEY_EVENTOS = 'aura_events_v2';

/** Primeira visita que força o seed do localStorage. */
async function semear(page: Page) {
  await page.goto(`/convite/${SLUG}/${TOKEN}`);
  await page.waitForFunction((chave) => localStorage.getItem(chave) !== null, KEY_EVENTOS);
}

/** Muda a ocasião do evento demo (o formulário de dados não a altera). */
async function definirOcasiao(page: Page, occasion: string) {
  await page.evaluate(
    ({ chave, id, ocasiao }) => {
      const eventos = JSON.parse(localStorage.getItem(chave) ?? '[]') as Array<
        Record<string, unknown>
      >;
      const evento = eventos.find((e) => e.id === id);
      if (evento) evento.occasion = ocasiao;
      localStorage.setItem(chave, JSON.stringify(eventos));
    },
    { chave: KEY_EVENTOS, id: EVENTO_ID, ocasiao: occasion }
  );
}

async function entrarComoCliente(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('o.seu.email@exemplo.com').fill('mariana.pedro@auranupcial.com');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL('**/cliente');
}

async function pularEnvelope(page: Page) {
  await page.getByRole('button', { name: 'Pular abertura e ver convite direto' }).click();
}

test.describe('Exemplos — cartões clicáveis', () => {
  test('os 3 exemplos abrem os convites de demonstração', async ({ page }) => {
    await page.goto('/exemplos');

    const convites = page.locator('a[href^="/convite/"]');
    await expect(convites).toHaveCount(3);
    await expect(convites.nth(0)).toHaveAttribute('href', '/convite/mariana-pedro/8Fk92KsP');
    await expect(convites.nth(1)).toHaveAttribute('href', '/convite/sofia-andre/marta-4Rc8Bn');
    await expect(convites.nth(2)).toHaveAttribute('href', '/convite/joana-miguel/domingos-3Vn9Pa');

    await convites.first().click();
    await expect(page).toHaveURL(/\/convite\/mariana-pedro\/8Fk92KsP/);
    await expect(
      page.getByRole('button', { name: 'Pular abertura e ver convite direto' })
    ).toBeVisible();
  });
});

test.describe('Aniversário — anos no formulário e no convite', () => {
  test('casamento não mostra o campo; aniversário mostra e o convite apresenta a idade', async ({
    page
  }) => {
    await semear(page);
    await definirOcasiao(page, 'casamento');

    await entrarComoCliente(page);
    await page.goto('/cliente/dados');
    await expect(page.getByText('Quantos anos')).toHaveCount(0);

    // Passa a ocasião a aniversário e recarrega o formulário.
    await definirOcasiao(page, 'aniversario');
    await page.reload();

    await page.getByPlaceholder('Ex.: 30').fill('30');
    await page.getByRole('button', { name: 'Guardar alterações' }).click();
    await expect(page.getByText(/Guardado!/)).toBeVisible();

    // Convite do convidado: idade no topo.
    await page.goto(`/convite/${SLUG}/${TOKEN}`);
    await pularEnvelope(page);
    const topo = page.locator('section').filter({ hasText: 'UM ANO A MAIS' }).first();
    await expect(topo).toContainText('30');
    await expect(topo).toContainText('anos');

    // Cartão impresso: a mesma idade.
    await page.goto(`/convite/${SLUG}/${TOKEN}/imprimir`);
    await expect(page.getByText('30 anos')).toBeVisible();
  });
});
