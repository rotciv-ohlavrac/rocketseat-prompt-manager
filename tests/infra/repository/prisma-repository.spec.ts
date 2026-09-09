import { Prompt } from '@/core/domain/prompts/prompts.entity';
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';
import { CreatePromptDTO } from '@/core/application/prompts/create-prompts.dto';
import { UpdatePromptDTO } from '@/core/application/prompts/update-prompt.dto';

type PromptDelegateMock = {
  create: jest.MockedFunction<
    (args: { data: CreatePromptDTO }) => Promise<void>
  >;
  update: jest.MockedFunction<
    (args: { where: { id: string }; data: UpdatePromptDTO }) => Promise<Prompt>
  >;
  delete: jest.MockedFunction<
    (args: { where: { id: string } }) => Promise<void>
  >;
  findFirst: jest.MockedFunction<
    (args: {
      where: { title: string };
    }) => Promise<Pick<Prompt, 'id' | 'title' | 'content'> | null>
  >;
  findUnique: jest.MockedFunction<
    (args: { where: { id: string } }) => Promise<Prompt | null>
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
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
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

  describe('update', () => {
    it('should update and return the prompt', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: 'new title',
        content: 'new content',
        createdAt: now,
        updatedAt: now,
      };
      prisma.prompt.update.mockResolvedValueOnce(input);

      const result = await repository.update(input.id, {
        title: input.title,
        content: input.content,
      });
      expect(prisma.prompt.update).toHaveBeenCalledWith({
        where: { id: input.id },
        data: { title: input.title, content: input.content },
      });
      expect(result).toEqual(input);
    });
    it('should only send just existing fields (ex: just title)', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: 'new title',
        content: '',
        createdAt: now,
        updatedAt: now,
      };
      prisma.prompt.update.mockResolvedValueOnce(input);

      await repository.update(input.id, { title: input.title });
      const call = prisma.prompt.update.mock.calls[0][0];

      expect(call.where).toEqual({ id: input.id });
      expect(call.data).toEqual({ title: input.title });
      expect('content' in call.data).toBe(false);
    });
    it('should only send just existing fields (ex: just content)', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: '',
        content: 'new content',
        createdAt: now,
        updatedAt: now,
      };
      prisma.prompt.update.mockResolvedValueOnce(input);

      await repository.update(input.id, { title: input.content });
      const call = prisma.prompt.update.mock.calls[0][0];

      expect(call.where).toEqual({ id: input.id });
      expect(call.data).toEqual({ title: input.content });
      expect('content' in call.data).toBe(false);
    });
  });

  describe('findById', () => {
    it('should return a prompt when it exists', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: 'title',
        content: 'content',
        createdAt: now,
        updatedAt: now,
      };

      prisma.prompt.findUnique.mockResolvedValueOnce(input);

      const result = await repository.findById(input.id);

      expect(prisma.prompt.findUnique).toHaveBeenCalledWith({
        where: { id: input.id },
      });
      expect(result).toEqual(input);
    });
    it('should return null when prompt does not exists', async () => {
      prisma.prompt.findUnique.mockResolvedValueOnce(null);

      const result = await repository.findById('1');

      expect(result).toEqual(null);
    });
  });
  describe('delete', () => {
    it('should call prisma.prompt.delete with where id', async () => {
      const promptId = '1';
      await repository.delete(promptId);
      expect(prisma.prompt.delete).toHaveBeenCalledWith({
        where: { id: promptId },
      });
    });
  });
});
