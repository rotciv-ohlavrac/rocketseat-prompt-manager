'use server';

import {
  CreatePromptDTO,
  createPromptSchema,
} from '@/core/application/prompts/create-prompts.dto';
import {
  UpdatePromptDTO,
  updatePromptSchema,
} from '@/core/application/prompts/update-prompt.dto';
import { SearchPromptsUseCase } from '@/core/application/prompts/search-prompts.use-case';
import { CreatePromptsUseCase } from '@/core/application/prompts/create-prompts.use-case';
import { UpdatePromptUseCase } from '@/core/application/prompts/update-prompts.use-case';
import { PromptSummary } from '@/core/domain/prompts/prompts.entity';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';
import { prismaClient } from '@/lib/prisma';
import z from 'zod';
import { DeletePromptUseCase } from '@/core/application/prompts/delete-prompts.use-case';
import { revalidatePath } from 'next/cache';

type SearchFormState = {
  success: boolean;
  prompts?: PromptSummary[];
  message?: string;
};

type FormState = {
  success: boolean;
  prompts?: PromptSummary[];
  errors?: unknown;
  message?: string;
};

export async function createPromptAction(
  data: CreatePromptDTO
): Promise<FormState> {
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
    revalidatePath('/', 'layout');
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

export async function deletePromptAction(id: string): Promise<FormState> {
  if (!id) {
    return { success: false, message: 'Id do prompt é obrigatório' };
  }
  try {
    const repository = new PrismaPromptRepository(prismaClient);
    const useCase = new DeletePromptUseCase(repository);
    await useCase.execute(id);
    revalidatePath('/', 'layout');

    return { success: true, message: 'Prompt removido com sucesso' };
  } catch (error) {
    const _error = error as Error;
    if (_error.message === 'PROMPT_NOT_FOUND') {
      return {
        success: false,
        message: 'Prompt não encontrado',
      };
    }
    return { success: false, message: 'Falha ao remover o prompt' };
  }
}

export async function updatePromptAction(
  data: UpdatePromptDTO
): Promise<FormState> {
  const validated = updatePromptSchema.safeParse(data);

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    return {
      success: false,
      message: 'Erro de validação',
      errors: fieldErrors,
    };
  }
  try {
    const repository = new PrismaPromptRepository(prismaClient);
    const useCase = new UpdatePromptUseCase(repository);
    await useCase.execute(validated.data);
    revalidatePath('/', 'layout');

    return { success: true, message: 'Prompt atualizado com sucesso' };
  } catch (error) {
    const _error = error as Error;
    if (_error.message === 'PROMPT_NOT_FOUND') {
      return {
        success: false,
        message: 'Prompt não encontrado',
      };
    }
    return {
      success: false,
      message: 'Falha ao atualizar o prompt',
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
