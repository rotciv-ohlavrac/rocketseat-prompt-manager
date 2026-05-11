import { Prompt } from './prompts.entity';

export interface PromptRepository {
  findMany(): Promise<Prompt[]>;
  searchMany(term: string): Promise<Prompt[]>;
}
