import { PromptForm } from '@/components/prompts/prompts-form';
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
jest.mock('@/app/actions/prompt.actions', () => ({
  createPromptAction: (...args: unknown[]) => createPromptActionMock(...args),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const makeSut = () => {
  return render(<PromptForm />);
};

describe('PromptForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    createPromptActionMock.mockReset();
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
});
