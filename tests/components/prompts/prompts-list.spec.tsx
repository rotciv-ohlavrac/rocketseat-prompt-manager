import {
  PromptsList,
  type PromptsListProps,
} from '@/components/prompts/prompts-list';
import { render, screen } from '@/lib/test-utils';

const makeSut = ({ prompts }: PromptsListProps) => {
  return render(<PromptsList prompts={prompts} />);
};

describe('PromptsList', () => {
  it('should render the list of prompts', () => {
    const input = [
      { id: '1', title: 'Prompt 01', content: 'Content 01' },
      { id: '2', title: 'Prompt 02', content: 'Content 02' },
    ];
    makeSut({ prompts: input });

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(input.length);
    expect(screen.getByText('Prompt 01')).toBeInTheDocument();
    expect(screen.getByText('Prompt 02')).toBeInTheDocument();
  });
  it('should not render the list of prompts when it is empty', () => {
    const input = [] as PromptsListProps['prompts'];
    makeSut({ prompts: input });

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
