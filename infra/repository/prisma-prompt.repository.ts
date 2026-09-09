import { PrismaClient } from '@/app/generated/prisma/client';
import { CreatePromptDTO } from '@/core/application/prompts/create-prompts.dto';
import { PromptRepository } from '@/core/domain/prompts/prompt.repository';
import { Prompt } from '@/core/domain/prompts/prompts.entity';

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

  async create(data: CreatePromptDTO): Promise<void> {
    await this.prismaClient.prompt.create({
      data: {
        title: data.title,
        content: data.content,
      },
    });
  }

  async update(id: string, data: Partial<CreatePromptDTO>): Promise<Prompt> {
    const updated = await this.prismaClient.prompt.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
      },
    });
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.prismaClient.prompt.delete({ where: { id } });
  }

  async findByTitle(title: string) {
    const prompt = await this.prismaClient.prompt.findFirst({
      where: { title },
    });
    return prompt;
  }

  async findById(id: string): Promise<Prompt | null> {
    const prompt = await this.prismaClient.prompt.findUnique({ where: { id } });
    return prompt;
  }
}
