import { CreatePromptDTO } from '@/core/application/prompts/create-prompts.dto';
import { Prompt } from './prompts.entity';

export interface PromptRepository {
  findMany(): Promise<Prompt[]>;
  findByTitle(title: string): Promise<Prompt | null>;
  searchMany(term: string): Promise<Prompt[]>;
  create(prompt: CreatePromptDTO): Promise<void>;
}
