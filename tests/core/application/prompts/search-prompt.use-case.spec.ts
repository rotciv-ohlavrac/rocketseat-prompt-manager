import { SearchPromptsUseCase } from '@/core/application/prompts/search-prompts.use-case';
import { Prompt } from '@/core/domain/prompts/prompts.entity';
import { PromptRepository } from '@/core/domain/prompts/prompt.repository';

describe('SearchPromptsUseCase', () => {
  const input: Prompt[] = [
    {
      id: '1',
      title: 'Title 01',
      content: 'Content 01',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Title 02',
      content: 'Content 02',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const repository: PromptRepository = {
    findMany: async () => input,
    searchMany: async (term: string) =>
      input.filter(
        (prompt) =>
          prompt.title.toLowerCase().includes(term.toLocaleLowerCase()) ||
          prompt.content.toLowerCase().includes(term.toLocaleLowerCase())
      ),
  } as PromptRepository;

  it('should return all prompts when the term is empty', async () => {
    const useCase = new SearchPromptsUseCase(repository);

    const results = await useCase.execute('');

    expect(results).toHaveLength(2);
  });

  it('should filter the list of prompts by the search term', async () => {
    const useCase = new SearchPromptsUseCase(repository);
    const query = 'title 01';

    const results = await useCase.execute(query);

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });

  it('should apply trim to searches with whitespace and return the full list of prompts', async () => {
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue([]);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const query = '   ';

    const results = await useCase.execute(query);

    expect(results).toHaveLength(2);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(searchMany).not.toHaveBeenCalled();
  });

  it('should search for a term with whitespace, handling it with trim', async () => {
    const firstElement = input.slice(0, 1);
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue(firstElement);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const query = ' title 02  ';

    const results = await useCase.execute(query);

    expect(results).toMatchObject(firstElement);
    expect(searchMany).toHaveBeenCalledWith(query.trim());
    expect(findMany).not.toHaveBeenCalled();
  });

  it('should handle undefined or null terms and return the full list of prompts', async () => {
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue([]);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const query = undefined as unknown as string;

    const results = await useCase.execute(query);

    expect(results).toMatchObject(input);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(searchMany).not.toHaveBeenCalled();
  });
});
