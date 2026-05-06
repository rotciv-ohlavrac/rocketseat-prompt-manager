import { SidebarContent } from '@/components/sidebar/sidebar-content';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));
const makeSut = () => {
  render(<SidebarContent />);
};

describe('SidebarContent', () => {
  const user = userEvent.setup();
  it('should render a new prompt button', () => {
    makeSut();

    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Novo Prompt' })
    ).toBeInTheDocument();
  });
  describe('Collapse / Expand', () => {
    it('should start expanded and show collapse button', () => {
      makeSut();

      const aside = screen.getByRole('complementary');
      expect(aside).toBeInTheDocument();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });
      expect(collapseButton).toBeInTheDocument();

      const expandButton = screen.queryByRole('button', {
        name: /expandir sidebar/i,
      });
      expect(expandButton).not.toBeInTheDocument();
    });
    it('should collapse the sidebar when collapse button is clicked', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });

      await user.click(collapseButton);

      const expandButton = screen.getByRole('button', {
        name: /expandir sidebar/i,
      });

      expect(expandButton).toBeInTheDocument();

      expect(collapseButton).not.toBeInTheDocument();
    });
  });
  describe('New Prompt', () => {
    it('should navigate to new prompt page when new prompt button is clicked', async () => {
      makeSut();

      const newPromptButton = screen.getByRole('button', {
        name: 'Novo Prompt',
      });
      await user.click(newPromptButton);

      expect(mockPush).toHaveBeenCalledWith('/new');
    });
  });
});
