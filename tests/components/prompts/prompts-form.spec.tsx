import { PromptForm, PromptFormProps } from '@/components/prompts/prompts-form';
import { render, screen } from '@/lib/test-utils';
import { toast } from 'sonner';
import userEvent from '@testing-library/user-event';

const mockedRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockedRefresh,
  }),
}));

const createPromptActionMock = jest.fn();
const updatePromptActionMock = jest.fn();
jest.mock('@/app/actions/prompt.actions', () => ({
  createPromptAction: (...args: unknown[]) => createPromptActionMock(...args),
  updatePromptAction: (...args: unknown[]) => updatePromptActionMock(...args),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const makeSut = ({ prompt }: PromptFormProps = {}) => {
  return render(<PromptForm prompt={prompt} />);
};

describe('PromptForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    createPromptActionMock.mockReset();
    updatePromptActionMock.mockReset();
    mockedRefresh.mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();
  });
  it('should create a new prompt correctly', async () => {
    const successMessage = 'Prompt criado com sucesso';
    createPromptActionMock.mockResolvedValue({
      success: true,
      message: successMessage,
    });
    makeSut();

    const input = { title: 'My Prompt Title', content: 'My Prompt Content' };

    const titleInput = screen.getByPlaceholderText(/Título do prompt/i);
    await user.type(titleInput, input.title);

    const contentInput = screen.getByPlaceholderText(
      /Digite o conteúdo do prompt.../i
    );
    await user.type(contentInput, input.content);

    const submitButton = screen.getByRole('button', { name: /Salvar/i });
    await user.click(submitButton);

    expect(createPromptActionMock).toHaveBeenCalledWith(input);
    expect(toast.success).toHaveBeenCalledWith(successMessage);
    expect(mockedRefresh).toHaveBeenCalledTimes(1);
  });
  it('should show an error toast when prompt creation fails', async () => {
    const errorMessage = 'Falha ao criar prompt';
    createPromptActionMock.mockResolvedValue({
      success: false,
      message: errorMessage,
    });
    makeSut();

    const input = { title: 'My Prompt Title', content: 'My Prompt Content' };

    const titleInput = screen.getByPlaceholderText(/Título do prompt/i);
    await user.type(titleInput, input.title);

    const contentInput = screen.getByPlaceholderText(
      /Digite o conteúdo do prompt.../i
    );
    await user.type(contentInput, input.content);

    const submitButton = screen.getByRole('button', { name: /Salvar/i });
    await user.click(submitButton);

    expect(createPromptActionMock).toHaveBeenCalledWith(input);
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
    expect(mockedRefresh).not.toHaveBeenCalled();
  });
  it('should show validation errors when form is submitted with empty fields', async () => {
    makeSut();

    const submitButton = screen.getByRole('button', { name: /Salvar/i });
    await user.click(submitButton);

    expect(screen.getByText(/Título é obrigatório/i)).toBeInTheDocument();
    expect(screen.getByText(/Conteúdo é obrigatório/i)).toBeInTheDocument();
    expect(createPromptActionMock).not.toHaveBeenCalled();
  });
  it('should update a existing prompt with success', async () => {
    updatePromptActionMock.mockResolvedValueOnce({
      success: true,
      message: 'Prompt atualizado com sucesso',
    });
    const now = new Date();
    const prompt = {
      id: '1',
      title: 'old',
      content: 'old',
      createdAt: now,
      updatedAt: now,
    };

    makeSut({ prompt });

    const titleInput = screen.getByPlaceholderText('Título do prompt');
    await user.clear(titleInput);
    await user.type(titleInput, 'new title');

    const contentInput = screen.getByPlaceholderText(
      'Digite o conteúdo do prompt...'
    );
    await user.clear(contentInput);
    await user.type(contentInput, 'new content');

    const submitButton = screen.getByRole('button', { name: 'Salvar' });
    await user.click(submitButton);

    expect(updatePromptActionMock).toHaveBeenCalledWith({
      id: prompt.id,
      title: 'new title',
      content: 'new content',
    });
    expect(toast.success).toHaveBeenCalledWith('Prompt atualizado com sucesso');
    expect(mockedRefresh).toHaveBeenCalledTimes(1);
  });
});
