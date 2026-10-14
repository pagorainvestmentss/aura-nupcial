import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

/**
 * E2E do ambiente ADMIN — guarda de rota, login demo (DEV),
 * check-in QR e exportação de CSV de relatórios.
 *
 * O login do admin vive em `/admin` (`AdminLoginPage`, mostrado por
 * `RequireAuth` quando não há sessão); `/login` é exclusivo do cliente.
 */

/** Mesma precedência de `getAdminAccounts()` (src/app/AuthContext.tsx). */
const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || 'admin@auranupcial.com';
const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD || 'admin123';

async function entrarComoAdmin(page: Page) {
  await page.goto('/admin');
  await page.getByPlaceholder('email de administração').fill(ADMIN_EMAIL);
  await page.getByPlaceholder('••••••••').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  // O formulário desaparece quando a sessão fica estabelecida.
  await expect(page.getByPlaceholder('email de administração')).toBeHidden();
}

test('/admin sem sessão mostra o login de admin no próprio /admin', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByRole('heading', { name: 'Administração Aura Nupcial' })).toBeVisible();
  await expect(page.getByPlaceholder('email de administração')).toBeVisible();
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
