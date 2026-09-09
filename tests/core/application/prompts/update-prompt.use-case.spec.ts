import { UpdatePromptDTO } from '@/core/application/prompts/update-prompt.dto';
import { UpdatePromptUseCase } from '@/core/application/prompts/update-prompts.use-case';
import { PromptRepository } from '@/core/domain/prompts/prompt.repository';

const makeRepository = (overrides: Partial<PromptRepository>) => {
  const base = {
    update: jest.fn(async (id, data) => ({
      id,
      title: data.title ?? '',
      content: data.content ?? '',
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    findById: jest.fn(async () => null),
  };

  return { ...base, ...overrides } as PromptRepository;
};

describe('UpdatePromptUseCase', () => {
  it('should update when prompt exists', async () => {
    const repository = makeRepository({
      findById: jest.fn().mockResolvedValue({
        id: '1',
        title: 'old title',
        content: 'old content',
      }),
    });
    const useCase = new UpdatePromptUseCase(repository);
    const input: UpdatePromptDTO = {
      id: '1',
      title: 'new title',
      content: 'new content',
    };

    const result = await useCase.execute(input);

    expect(result.title).toBe(input.title);
    expect(repository.update).toHaveBeenCalledWith(input.id, {
      title: input.title,
      content: input.content,
    });
  });
  it('should fail when the prompt does not exists', async () => {
    const repository = makeRepository({
      findById: jest.fn().mockResolvedValue(null),
    });
    const useCase = new UpdatePromptUseCase(repository);
    const input = {
      id: '1',
      title: 'title',
      content: 'content',
    };

    await expect(useCase.execute(input)).rejects.toThrow('PROMPT_NOT_FOUND');
  });
});
