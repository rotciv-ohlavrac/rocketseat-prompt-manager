import {
  PromptsCard,
  type PromptsCardProps,
} from '@/components/prompts/prompts-card';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

const mockedDelete = jest.fn();
jest.mock('@/app/actions/prompt.actions', () => ({
  deletePromptAction: (id: string) => mockedDelete(id),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockedRefresh,
  }),
}));

const makeSut = ({ prompt }: PromptsCardProps) => {
  return render(<PromptsCard prompt={prompt} />);
};

describe('PromptsCard', () => {
  beforeEach(() => {
    mockedDelete.mockReset();
    mockedRefresh.mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();
  });

  const user = userEvent.setup();
  const input = {
    id: '1',
    title: 'Prompt 01',
    content: 'Content 01',
  };
  it('should render the link with href correctly', () => {
    makeSut({ prompt: input });

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', `/${input.id}`);
  });
  it('should open remove dialog of a prompt', async () => {
    makeSut({ prompt: input });

    const deleteButton = screen.getByRole('button', { name: 'Remover Prompt' });
    await user.click(deleteButton);

    expect(screen.getByText('Remover prompt')).toBeInTheDocument();
  });
  it('should remove with success and show toast', async () => {
    mockedDelete.mockResolvedValueOnce({
      success: true,
      message: 'Prompt removido com sucesso!',
    });
    makeSut({ prompt: input });

    const deleteButton = screen.getByRole('button', { name: 'Remover Prompt' });
    await user.click(deleteButton);
    await user.click(screen.getByRole('button', { name: 'Confirmar remoção' }));

    expect(toast.success).toHaveBeenCalledWith('Prompt removido com sucesso!');
    expect(mockedRefresh).toHaveBeenCalledTimes(1);
  });
  it('should show error when action fails', async () => {
    const errorMessage = 'Erro ao remover prompt';
    mockedDelete.mockResolvedValue({ success: false, message: errorMessage });

    makeSut({ prompt: input });

    const deleteButton = screen.getByRole('button', { name: 'Remover Prompt' });
    await user.click(deleteButton);
    await user.click(screen.getByRole('button', { name: 'Confirmar remoção' }));

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
    expect(mockedRefresh).not.toHaveBeenCalledTimes(1);
  });
  it('should show a error when action throws a exception', async () => {
    const errorMessage = 'Erro';
    mockedDelete.mockRejectedValue(new Error(errorMessage));

    makeSut({ prompt: input });

    const deleteButton = screen.getByRole('button', { name: 'Remover Prompt' });
    await user.click(deleteButton);
    await user.click(screen.getByRole('button', { name: 'Confirmar remoção' }));

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
    expect(mockedRefresh).not.toHaveBeenCalledTimes(1);
  });
});
