import { prismaClient } from '@/lib/prisma';
import { SidebarContent } from './sidebar-content';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';
import { PromptSummary } from '@/core/domain/prompts/prompts.entity';
import { Suspense } from 'react';
import { Spinner } from '../ui/spinner';

async function Sidebar() {
  const repository = new PrismaPromptRepository(prismaClient);

  let initialPrompts: PromptSummary[] = [];

  try {
    const prompts = await repository.findMany();
    initialPrompts = prompts.map((prompt) => ({ ...prompt }));
  } catch {
    initialPrompts = [];
  }

  return (
    <Suspense fallback={<Spinner />}>
      <SidebarContent prompts={initialPrompts} />
    </Suspense>
  );
}

export { Sidebar };
