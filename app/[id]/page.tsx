import { PromptForm } from '@/components/prompts';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';
import { prismaClient } from '@/lib/prisma';

type PromptPageProps = { params: Promise<{ id: string }> };

export default async function PromptPage({ params }: PromptPageProps) {
  const { id } = await params;
  const prismaRepository = new PrismaPromptRepository(prismaClient);
  const prompt = await prismaRepository.findById(id);

  return <PromptForm prompt={prompt} />;
}
