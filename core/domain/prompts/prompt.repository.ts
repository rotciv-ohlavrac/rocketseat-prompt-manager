import { CreatePromptDTO } from '@/core/application/prompts/create-prompts.dto';
import { Prompt } from './prompts.entity';

export interface PromptRepository {
  findMany(): Promise<Prompt[]>;
  findByTitle(title: string): Promise<Prompt | null>;
  findById(id: string): Promise<Prompt | null>;
  searchMany(term: string): Promise<Prompt[]>;
  create(prompt: CreatePromptDTO): Promise<void>;
  update(id: string, data: Partial<CreatePromptDTO>): Promise<Prompt>;
  delete(id: string): Promise<void>;
}
