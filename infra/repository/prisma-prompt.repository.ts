import { PrismaClient } from '@/app/generated/prisma/client';
import { PromptRepository } from '@/core/domain/prompts/prompt.repository';

export class PrismaPromptRepository implements PromptRepository {
  constructor(private prismaClient: PrismaClient) {}

  async findMany() {
    return this.prismaClient.prompt.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchMany(term: string) {
    const q = term?.trim() ?? '';
    return this.prismaClient.prompt.findMany({
      where: q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }
}
