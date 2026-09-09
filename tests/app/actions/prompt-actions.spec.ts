import {
  createPromptAction,
  deletePromptAction,
  searchPromptAction,
  updatePromptAction,
} from '@/app/actions/prompt.actions';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));

const mockedSearchExecute = jest.fn();
const mockedCreateExecute = jest.fn();
const mockedUpdateExecute = jest.fn();
const mockedDeleteExecute = jest.fn();

jest.mock('@/core/application/prompts/search-prompts.use-case', () => ({
  SearchPromptsUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedSearchExecute })),
}));

jest.mock('@/core/application/prompts/create-prompts.use-case', () => ({
  CreatePromptsUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedCreateExecute })),
}));

jest.mock('@/core/application/prompts/update-prompts.use-case', () => ({
  UpdatePromptUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedUpdateExecute })),
}));

jest.mock('@/core/application/prompts/delete-prompts.use-case', () => ({
  DeletePromptUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedDeleteExecute })),
}));

describe('Server Actions: Prompts', () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
    mockedCreateExecute.mockReset();
    mockedUpdateExecute.mockReset();
    mockedDeleteExecute.mockReset();
  });

  describe('searchPromptAction', () => {
    it('should return success with non-empty search term', async () => {
      const input = [{ id: '1', title: 'AI Title', content: 'Content' }];
      mockedSearchExecute.mockResolvedValue(input);
      const formData = new FormData();
      formData.append('q', 'AI');

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('should return success and list all prompts when term is empty', async () => {
      const input = [
        { id: '1', title: 'First', content: 'Content 01' },
        { id: '2', title: 'Second', content: 'Content 02' },
      ];
      mockedSearchExecute.mockResolvedValue(input);
      const formData = new FormData();
      formData.append('q', '');

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBeDefined();
      expect(result.prompts).toEqual(input);
    });

    it('should return a generic error when search fails', async () => {
      const error = new Error('UNKNOWN');
      mockedSearchExecute.mockResolvedValue(error);

      const formData = new FormData();
      formData.append('q', 'error');

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBe(false);
      expect(result.prompts).toBe(undefined);
      expect(result.message).toBe('Falha ao buscar prompts.');
    });

    it('should trim spaces from term before executing', async () => {
      const input = [{ id: '1', title: 'title 01', content: 'content 01' }];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append('q', '   title 01  ');

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('title 01');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('should treat missing query as empty term', async () => {
      const input = [
        { id: '1', title: 'first title', content: 'content 01' },
        { id: '2', title: 'second title', content: 'content 02' },
      ];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });
  });
  describe('createPromptAction', () => {
    it('should return validation errors for invalid input', async () => {
      const invalidData = { title: '', content: '' };

      const result = await createPromptAction(invalidData);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Erro de validação');
      expect(result?.errors).toEqual({
        title: ['Título é obrigatório'],
        content: ['Conteúdo é obrigatório'],
      });
    });

    it('should return error when prompt already exists', async () => {
      const existingPromptData = {
        title: 'Existing Prompt',
        content: 'Content',
      };
      mockedCreateExecute.mockRejectedValue(new Error('PROMPT_ALREADY_EXISTS'));

      const result = await createPromptAction(existingPromptData);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Prompt já existe');
    });
    it('should create a new prompt successfully', async () => {
      const newPromptData = { title: 'New Prompt', content: 'Content' };
      mockedCreateExecute.mockResolvedValue({ id: '1', ...newPromptData });

      const result = await createPromptAction(newPromptData);

      expect(result?.success).toBe(true);
      expect(result?.message).toBe('Prompt criado com sucesso');
    });
    it('should return a generic error for unexpected errors', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('UNKOWN'));
      const newPromptData = { title: 'New Prompt', content: 'Content' };

      const result = await createPromptAction(newPromptData);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Falha ao criar prompt');
    });
  });
  describe('updatePromptAction', () => {
    it('should update prompt successfully', async () => {
      mockedUpdateExecute.mockResolvedValueOnce({});
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'new title',
        content: 'new content',
      };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Prompt atualizado com sucesso');
    });
    it('should return validation error when there are missing fields', async () => {
      const data = {
        id: '1',
        title: '',
        content: '',
      };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Erro de validação');
      expect(result.errors).toBeDefined();
    });
    it('should return error when prompt does not exists', async () => {
      mockedUpdateExecute.mockRejectedValue(new Error('PROMPT_NOT_FOUND'));

      const promptId = '1';
      const data = {
        id: promptId,
        title: 'New',
        content: 'Content',
      };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Prompt não encontrado');
    });
    it('should return generic error when failed to update prompt', async () => {
      mockedUpdateExecute.mockRejectedValue(new Error('UNKOWN'));
      const promptId = '1';

      const data = {
        id: promptId,
        title: 'title',
        content: 'content',
      };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Falha ao atualizar o prompt');
    });
  });
  describe('deletePromptAction', () => {
    it('should return error when id is empty', async () => {
      const promptId = '';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Id do prompt é obrigatório');
    });
    it('should return error when prompt does not exists', async () => {
      const errorMessage = 'PROMPT_NOT_FOUND';
      mockedDeleteExecute.mockRejectedValue(new Error(errorMessage));
      const promptId = '1';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Prompt não encontrado');
    });
    it('should return generic error when action fails', async () => {
      mockedDeleteExecute.mockRejectedValue(new Error('UNKNOWN'));
      const promptId = '1';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Falha ao remover o prompt');
    });
    it('should delete prompt successfully', async () => {
      mockedDeleteExecute.mockResolvedValue(undefined);
      const promptId = '1';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Prompt removido com sucesso');
    });
  });
});
