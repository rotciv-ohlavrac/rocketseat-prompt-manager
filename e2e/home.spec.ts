import { test, expect, type Page } from '@playwright/test';

test('should load the initial page', async ({ page }: { page: Page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Selecione um prompt' })
  ).toBeVisible();

  await expect(
    page.getByText(
      'Escolha um prompt da lista ao lado para visualizar e editar'
    )
  ).toBeVisible();
});
