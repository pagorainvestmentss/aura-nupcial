import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

/**
 * E2E do ambiente ADMIN — guarda de rota, login demo (DEV),
 * check-in QR e exportação de CSV de relatórios.
 */

async function entrarComoAdmin(page: Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Entrar como admin' }).click();
  await expect(page).toHaveURL(/\/admin/);
}

test('/admin sem sessão redireciona para /login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
});

test('login demo de admin abre o painel', async ({ page }) => {
  await entrarComoAdmin(page);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByText('Total de convidados')).toBeVisible();
});

test('check-in QR valida o passo e bloqueia a repetição', async ({ page }) => {
  await entrarComoAdmin(page);
  await page.goto('/admin/qr-checkin');

  await page.getByPlaceholder('Ex: 8Fk92KsP ou cole a URL').fill('8Fk92KsP');
  await page.getByRole('button', { name: 'Validar' }).click();
  await expect(page.getByRole('heading', { name: 'VÁLIDO · ENTRADA AUTORIZADA' })).toBeVisible();

  await page.getByRole('button', { name: 'Validar' }).click();
  await expect(page.getByRole('heading', { name: 'JÁ UTILIZADO' })).toBeVisible();
});

test('exportação de CSV de relatórios tem 10 colunas no cabeçalho', async ({ page }) => {
  await entrarComoAdmin(page);
  await page.goto('/admin/relatorios');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar CSV' }).click();
  const download = await downloadPromise;
  const caminho = await download.path();
  expect(caminho).not.toBeNull();

  const conteudo = readFileSync(caminho!, 'utf-8');
  const cabecalho = conteudo.split(/\r?\n/)[0].trim();
  expect(cabecalho.split(',')).toHaveLength(10);
});
