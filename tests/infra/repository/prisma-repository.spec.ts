import { Prompt } from '@/core/domain/prompts/prompts.entity';
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';

type PromptDelegateMock = {
  create: jest.MockedFunction<
    (args: { data: { title: string; content: string } }) => Promise<void>
  >;
  findFirst: jest.MockedFunction<
    (args: {
      where: { title: string };
    }) => Promise<Pick<Prompt, 'id' | 'title' | 'content'> | null>
  >;
  findMany: jest.MockedFunction<
    (args: {
      orderBy?: { createdAt: 'asc' | 'desc' };
      where?: {
        OR: Array<{
          title?: { contains: string; mode: 'insensitive' };
          content?: { contains: string; mode: 'insensitive' };
        }>;
      };
    }) => Promise<Prompt[]>
  >;
};

type PrismaMock = {
  prompt: PromptDelegateMock;
};

function createMockPrisma() {
  const mock: PrismaMock = {
    prompt: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  return mock as unknown as PrismaClient & PrismaMock;
}

describe('PrismaPromptRepository', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repository: PrismaPromptRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repository = new PrismaPromptRepository(prisma);
  });
  describe('create', () => {
    it('deve criar um prompt com os dados fornecidos', async () => {
      const newPromptData = { title: 'New Prompt', content: 'Content' };

      await repository.create(newPromptData);

      expect(prisma.prompt.create).toHaveBeenCalledWith({
        data: newPromptData,
      });
    });
  });
  describe('findByTitle', () => {
    it('deve retornar o prompt correspondente ao título fornecido', async () => {
      const existingPrompt = {
        id: '1',
        title: 'Existing Prompt',
        content: 'Content',
      };
      prisma.prompt.findFirst.mockResolvedValue(existingPrompt);

      const result = await repository.findByTitle('Existing Prompt');

      expect(prisma.prompt.findFirst).toHaveBeenCalledWith({
        where: { title: 'Existing Prompt' },
      });
      expect(result).toEqual(existingPrompt);
    });

    it('deve retornar null se nenhum prompt for encontrado', async () => {
      prisma.prompt.findFirst.mockResolvedValue(null);

      const result = await repository.findByTitle('Nonexistent Prompt');

      expect(prisma.prompt.findFirst).toHaveBeenCalledWith({
        where: { title: 'Nonexistent Prompt' },
      });
      expect(result).toBeNull();
    });
  });
  describe('findMany', () => {
    it('deve ordenar por createdAt desc e mapear os resultados', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Title 01',
          content: 'Content 01',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: '2',
          title: 'Title 02',
          content: 'Content 02',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.findMany();

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });
  });

  describe('searchMany', () => {
    it('deve buscar por termo vazio e não enviar o where', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Title 01',
          content: 'Content 01',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.searchMany('    ');

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });

    it('deve buscar por termo e popular OR no where', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Title 01',
          content: 'Content 01',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.searchMany('  title 01  ');

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'title 01', mode: 'insensitive' } },
            { content: { contains: 'title 01', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });
  });
});
