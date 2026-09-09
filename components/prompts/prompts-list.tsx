import { PromptSummary } from '@/core/domain/prompts/prompts.entity';
import { PromptsCard } from './prompts-card';
import { motion } from 'motion/react';

type PromptsListProps = {
  prompts: PromptSummary[];
};

function PromptsList({ prompts }: PromptsListProps) {
  const renderPrompts = () => {
    return prompts.map((prompt) => (
      <PromptsCard key={prompt.id} prompt={prompt} />
    ));
  };
  return (
    <motion.ul
      className="space-y-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      layout
    >
      {renderPrompts()}
    </motion.ul>
  );
}

export { PromptsList };
export type { PromptsListProps };
