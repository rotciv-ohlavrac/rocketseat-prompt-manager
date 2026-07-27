import { CopyButton } from '@/components/button-actions/copy-button';
import { render, screen, waitFor, act } from '@/lib/test-utils';
import { toast } from 'sonner';
import userEvent from '@testing-library/user-event';

import type { CopyButtonProps } from '@/components/button-actions/copy-button';

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const writeTextMock = jest.fn();

const makeSut = ({ content = '' }: CopyButtonProps = {} as CopyButtonProps) => {
  return render(<CopyButton content={content} />);
};

describe('CopyButton', () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  beforeEach(() => {
    writeTextMock.mockReset();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
    });
    jest.useFakeTimers({ legacyFakeTimers: true });
  });

  it('Should disable the button when content is empty', async () => {
    const input = { content: '      ' };
    makeSut(input);

    const button = screen.getByRole('button', { name: /copiar/i });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(writeTextMock).not.toHaveBeenCalled();
  });
  it('Should copy the content to clipboard when button is clicked and change label to "Copied" for 2 seconds', async () => {
    writeTextMock.mockResolvedValueOnce(undefined);

    const input = { content: 'Hello World' };
    makeSut(input);

    const button = screen.getByRole('button', { name: /copiar/i });

    await user.click(button);

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /copiado/i })
      ).toBeInTheDocument()
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /copiar/i })
      ).toBeInTheDocument()
    );
  });
  it('Should show an error toast when copy to clipboard fails', async () => {
    const errorMessage = 'Falha ao copiar';
    const error = new Error(errorMessage);

    jest
      .spyOn(global.navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(error);

    const input = { content: 'Hello World' };
    makeSut(input);

    const button = screen.getByRole('button', { name: /copiar/i });

    await user.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        `Erro ao copiar o texto: ${errorMessage}`
      );
    });
    expect(screen.getByRole('button', { name: /copiar/i })).toBeInTheDocument();
  });
  it('Should clear previous timeout before copying again', async () => {
    writeTextMock.mockResolvedValueOnce(undefined);

    const clearSpy = jest.spyOn(window, 'clearTimeout');

    const input = { content: 'Hello World' };
    makeSut(input);

    const button = screen.getByRole('button', { name: /copiar/i });

    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /copiado/i })
      ).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /copiado/i }));

    expect(clearSpy).toHaveBeenCalled();

    clearSpy.mockRestore();
  });
});
