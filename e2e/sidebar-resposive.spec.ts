import { test, expect } from '@playwright/test';

test('Mobile: hamburger menu should open and close sidebar', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');

  const openButton = page.getByRole('button', { name: 'Abrir menu' });
  await expect(openButton).toBeVisible();
  await expect(openButton).toHaveAttribute('aria-expanded', 'false');

  await openButton.click();
  await expect(openButton).toHaveAttribute('aria-expanded', 'true');

  const aside = page.getByRole('complementary');
  expect(aside).toBeInViewport();

  const closeButton = page.getByRole('button', { name: 'Fechar menu' });
  await expect(closeButton).toBeInViewport();

  const searchInput = page.getByPlaceholder('Buscar prompts...');
  await expect(searchInput).toBeInViewport();

  await closeButton.click();
  await expect(openButton).toHaveAttribute('aria-expanded', 'false');
  await expect(aside).not.toBeInViewport();
  await expect(closeButton).not.toBeInViewport();
  await expect(searchInput).not.toBeInViewport();
});

test('Desktop: hamburger menu should be hidden and content visible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/');

  const openButton = page.getByRole('button', { name: 'Abrir menu' });
  await expect(openButton).toBeHidden();

  const searchInput = page.getByPlaceholder('Buscar prompts...');
  await expect(searchInput).toBeVisible();

  const collapseButton = page.getByRole('button', {
    name: 'Minimizar sidebar',
  });
  await expect(collapseButton).toBeVisible();

  const closeButton = page.getByRole('button', { name: 'Fechar menu' });
  await expect(closeButton).toBeHidden();

  const heading = page.getByRole('heading', { name: 'Selecione um prompt' });
  await expect(heading).toBeVisible();
});
