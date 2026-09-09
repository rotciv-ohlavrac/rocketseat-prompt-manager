import { DeletePromptUseCase } from '@/core/application/prompts/delete-prompts.use-case';
import { PromptRepository } from '@/core/domain/prompts/prompt.repository';

function makeRepository(
  overrides: Partial<PromptRepository> = {} as PromptRepository
): PromptRepository {
  const base = {
    delete: jest.fn(async () => {}),
    findById: jest.fn(async () => {}),
  };
  return { ...base, ...overrides } as PromptRepository;
}

describe('DeletePromptUseCase', () => {
  it('should delete prompt when it exists', async () => {
    const now = new Date();
    const prompt = {
      id: '1',
      title: 'title',
      content: 'content',
      createdAt: now,
      updatedAt: now,
    };

    const repository = makeRepository({
      findById: jest.fn().mockResolvedValue(prompt),
      delete: jest.fn().mockResolvedValue(undefined),
    });

    const useCase = new DeletePromptUseCase(repository);
    const result = await useCase.execute(prompt.id);

    expect(result).toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith(prompt.id);
  });
  it('should fails with PROMPT_NOT_FOUND when prompt does not exists', async () => {
    const repository = makeRepository({
      findById: jest.fn().mockResolvedValue(null),
    });
    const useCase = new DeletePromptUseCase(repository);

    await expect(useCase.execute('1')).rejects.toThrow('PROMPT_NOT_FOUND');
  });
});
