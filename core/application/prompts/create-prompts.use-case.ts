import { PromptRepository } from '@/core/domain/prompts/prompt.repository';
import { CreatePromptDTO } from './create-prompts.dto';

export class CreatePromptsUseCase {
  constructor(private promptRepository: PromptRepository) {}

  async execute(data: CreatePromptDTO) {
    const promptExists = await this.promptRepository.findByTitle(data.title);
    if (promptExists) {
      throw new Error('PROMPT_ALREADY_EXISTS');
    }

    await this.promptRepository.create(data);
  }
}
