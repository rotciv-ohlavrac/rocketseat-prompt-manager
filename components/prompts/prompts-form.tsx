'use client';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreatePromptDTO,
  createPromptSchema,
} from '@/core/application/prompts/create-prompts.dto';
import { Field, FieldLabel, FieldError } from '../ui/field';
import { createPromptAction } from '@/app/actions/prompt.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CopyButton } from '../button-actions';

export const PromptForm = () => {
  const router = useRouter();
  const form = useForm<CreatePromptDTO>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const content = useWatch({ name: 'content', control: form.control });

  async function onSubmit(data: CreatePromptDTO) {
    const result = await createPromptAction(data);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <header className="flex flex-wrap gap-2 items-center mb-6 justify-end">
        <CopyButton content={content} />
        <Button type="submit" size="sm">
          Salvar
        </Button>
      </header>
      <Controller
        name="title"
        control={form.control}
        render={({ field, fieldState }) => {
          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Titulo</FieldLabel>
              <Input
                {...field}
                placeholder="Título do prompt"
                variant="transparent"
                size="lg"
                autoFocus
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          );
        }}
      />

      <Controller
        name="content"
        control={form.control}
        render={({ field, fieldState }) => {
          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Conteúdo</FieldLabel>
              <Textarea
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="Digite o conteúdo do prompt..."
                variant="transparent"
                size="lg"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          );
        }}
      />
    </form>
  );
};
