import z from 'zod';

const createPromptSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
});

type CreatePromptDTO = z.infer<typeof createPromptSchema>;

export { createPromptSchema };
export type { CreatePromptDTO };
