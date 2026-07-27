'use server';

import {
  CreatePromptDTO,
  createPromptSchema,
} from '@/core/application/prompts/create-prompts.dto';
import { SearchPromptsUseCase } from '@/core/application/prompts/search-prompts.use-case';
import { CreatePromptsUseCase } from '@/core/application/prompts/create-prompts.use-case';
import { PromptSummary } from '@/core/domain/prompts/prompts.entity';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';
import { prismaClient } from '@/lib/prisma';
import z from 'zod';

type SearchFormState = {
  success: boolean;
  prompts?: PromptSummary[];
  message?: string;
};

export async function createPromptAction(data: CreatePromptDTO) {
  const validated = createPromptSchema.safeParse(data);
  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    return {
      success: false,
      message: 'Erro de validação',
      errors: fieldErrors,
    };
  }

  try {
    const respository = new PrismaPromptRepository(prismaClient);
    const useCase = new CreatePromptsUseCase(respository);
    await useCase.execute(data);
    return {
      success: true,
      message: 'Prompt criado com sucesso',
    };
  } catch (error) {
    const _error = error as Error;
    if (_error.message === 'PROMPT_ALREADY_EXISTS') {
      return {
        success: false,
        message: 'Prompt já existe',
      };
    }
    return {
      success: false,
      message: 'Falha ao criar prompt',
    };
  }
}

export async function searchPromptAction(
  _prev: SearchFormState,
  formData: FormData
): Promise<SearchFormState> {
  const term = String(formData.get('q') ?? '').trim();
  const repository = new PrismaPromptRepository(prismaClient);
  const useCase = new SearchPromptsUseCase(repository);

  try {
    const results = await useCase.execute(term);

    const summaries = results.map(({ id, title, content }) => ({
      id,
      title,
      content,
    }));

    return {
      success: true,
      prompts: summaries,
    };
  } catch {
    return {
      success: false,
      message: 'Falha ao buscar prompts.',
    };
  }
}
