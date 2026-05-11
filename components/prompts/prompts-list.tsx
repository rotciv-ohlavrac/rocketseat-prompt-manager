import { PromptSummary } from '@/core/domain/prompts/prompts.entity';
import { PromptsCard } from './prompts-card';

type PromptsListProps = {
  prompts: PromptSummary[];
};

function PromptsList({ prompts }: PromptsListProps) {
  const renderPrompts = () => {
    return prompts.map((prompt) => (
      <PromptsCard key={prompt.id} prompt={prompt} />
    ));
  };
  return <ul>{renderPrompts()}</ul>;
}

export { PromptsList };
export type { PromptsListProps };
