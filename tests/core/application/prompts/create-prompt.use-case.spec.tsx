import { PromptRepository } from '@/core/domain/prompts/prompt.repository';
import { CreatePromptsUseCase } from '@/core/application/prompts/create-prompts.use-case';

const makeRepository = (overrides: Partial<PromptRepository>) => {
  const base = {
    create: jest.fn(async () => undefined),
  };
  return { ...base, ...overrides } as PromptRepository;
};

describe('CreatePromptsUseCase', () => {
  it('should create a new prompt when there is no duplicate title', async () => {
    const repository = makeRepository({
      findByTitle: jest.fn().mockResolvedValue(null),
    });

    const useCase = new CreatePromptsUseCase(repository);

    const input = {
      title: 'New Prompt',
      content: 'This is a new prompt',
    };

    await expect(useCase.execute(input)).resolves.toBeUndefined();
    expect(repository.create).toHaveBeenCalledWith(input);
  });
  it('should throw an error when there is a duplicate title', async () => {
    const repository = makeRepository({
      findByTitle: jest.fn().mockResolvedValue({
        id: '1',
        title: 'Duplicate Prompt',
        content: 'This is a duplicate prompt',
      }),
    });

    const useCase = new CreatePromptsUseCase(repository);

    const input = {
      title: 'Duplicate Prompt',
      content: 'This is a new prompt',
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      'PROMPT_ALREADY_EXISTS'
    );
    expect(repository.create).not.toHaveBeenCalled();
  });
});
