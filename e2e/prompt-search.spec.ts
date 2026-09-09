import { PrismaClient } from '@/app/generated/prisma/client';
import { test, expect } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';

test('Search for prompts from UI (SUCCESS)', async ({ page }) => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const now = Date.now();
  const uniqueTitleAlpha = `E2E Alpha Original ${now}`;
  const uniqueContentAlpha = 'Alpha Content';
  const uniqueTitleBeta = `E2E Beta Original ${now}`;
  const uniqueContentBeta = 'Beta Content';

  await prisma.prompt.createMany({
    data: [
      {
        title: uniqueTitleAlpha,
        content: uniqueContentAlpha,
      },
      { title: uniqueTitleBeta, content: uniqueContentBeta },
    ],
  });
  await prisma.$disconnect();

  await page.goto('/');

  const searchInput = page.getByPlaceholder('Buscar prompts...');
  await expect(searchInput).toBeVisible();

  await searchInput.fill(uniqueTitleAlpha);
  await expect(page.getByText(uniqueTitleAlpha)).toHaveCount(1);

  await searchInput.fill(uniqueTitleBeta);
  await expect(page.getByText(uniqueTitleBeta)).toHaveCount(1);

  const notExists = `E2E Search Not Exists ${now}`;
  await searchInput.fill(notExists);
  await expect(page.getByText(notExists)).toHaveCount(0);
});
