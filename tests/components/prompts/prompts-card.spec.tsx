import {
  PromptsCard,
  type PromptsCardProps,
} from '@/components/prompts/prompts-card';
import { render, screen } from '@/lib/test-utils';

const makeSut = ({ prompt }: PromptsCardProps) => {
  return render(<PromptsCard prompt={prompt} />);
};

describe('PromptsCard', () => {
  it('should render the link with href correctly', () => {
    const input = {
      id: '1',
      title: 'Prompt 01',
      content: 'Content 01',
    };
    makeSut({ prompt: input });

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', `/${input.id}`);
  });
});
