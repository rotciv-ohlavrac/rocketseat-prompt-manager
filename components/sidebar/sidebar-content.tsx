'use client';

import React, {
  startTransition,
  useActionState,
  useEffect,
  useRef,
} from 'react';
import { Button } from '../ui/button';
import {
  ArrowLeftToLine,
  X as CloseButton,
  Plus as AddIcon,
  ArrowRightToLine,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '../logo';
import { Input } from '../ui/input';
import { PromptSummary } from '@/core/domain/prompts/prompts.entity';
import { PromptsList } from '../prompts';
import { searchPromptAction } from '@/app/actions/prompt.actions';
import { Spinner } from '../ui/spinner';

export type SidebarContentProps = {
  prompts: PromptSummary[];
};

function SidebarContent({ prompts }: SidebarContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);
  const [query, setQuery] = React.useState<string>(searchParams.get('q') ?? '');

  const formRef = useRef<HTMLFormElement>(null);

  const [searchState, searchAction, isPending] = useActionState(
    searchPromptAction,
    { success: true, prompts }
  );

  const hasQuery = query.trim().length > 0;
  const promptList = hasQuery ? (searchState.prompts ?? prompts) : prompts;

  const collapseSidebar = () => setIsCollapsed(true);
  const expandSidebar = () => setIsCollapsed(false);

  const handleNewPrompt = () => router.push('/new');

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    startTransition(() => {
      const url = newQuery ? `/?q=${encodeURIComponent(newQuery)}` : '/';
      router.push(url, { scroll: false });
      formRef.current?.requestSubmit();
    });
  };

  const renderSpinner = () => {
    if (!isPending) return null;
    return (
      <div
        title="Carregando prompts"
        aria-label="Carregando prompts"
        className="absolute right-2 left-auto top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-300"
      >
        <Spinner />
      </div>
    );
  };

  const renderContent = () => {
    if (isCollapsed)
      return (
        <section className="px-2 py-6">
          <header className="flex items-center justify-center mb-6">
            <Button
              variant="icon"
              className="hidden md:inline-flex p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-lg transition-colors"
              aria-label="Expandir sidebar"
              title="Expandir sidebar"
              onClick={expandSidebar}
            >
              <ArrowRightToLine className="w-5 h-5 text-gray-100" />
            </Button>
          </header>
          <div className="flex flex-col items-center space-y-4">
            <Button
              onClick={handleNewPrompt}
              aria-label="Novo prompt"
              title="Novo prompt"
            >
              <AddIcon className="w-5 h-5 text-white" />
            </Button>
          </div>
        </section>
      );

    return (
      <>
        <section className="p-6">
          <div className="md:hidden mb-4">
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                aria-label="Fechar menu"
                title="Fechar menu"
              >
                <CloseButton className="w-5 h-5 text-gray-100" />
              </Button>
            </div>
          </div>
          <div className="flex w-full items-center justify-between mb-6">
            <header className="flex w-full items-center justify-between">
              <Logo />
              <Button
                variant="icon"
                className="hidden md:inline-flex p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-lg transition-colors"
                onClick={collapseSidebar}
                aria-label="Minimizar sidebar"
                title="Minimizar sidebar"
              >
                <ArrowLeftToLine className="w-5 h-5 text-gray-100" />
              </Button>
            </header>
          </div>
          <section className="mb-5">
            <form
              action={searchAction}
              className="relative group w-full"
              ref={formRef}
            >
              <Input
                name="q"
                type="text"
                placeholder="Buscar prompts..."
                autoFocus
                value={query}
                onChange={handleQueryChange}
              />
              {renderSpinner()}
            </form>
          </section>
          <div className="">
            <Button className="w-full" size="lg" onClick={handleNewPrompt}>
              <AddIcon className="w-5 h-5 mr-2" />
              Novo Prompt
            </Button>
          </div>
        </section>
        <nav
          className="flex-1 overflow-auto px-6 pb-6"
          aria-label="Lista de prompts"
        >
          <PromptsList prompts={promptList} />
        </nav>
      </>
    );
  };

  useEffect(() => {
    if (hasQuery) return;
    formRef.current?.requestSubmit();
  }, [hasQuery]);

  return (
    <aside
      className={`border-r border-gray-700 flex flex-col h-full bg-gray-800 transition-[transform, width] duration-300 ease-in-out fixed md:relative left-0 top-0 z-50 md:z-auto w-[80vw] sm:w-[320px] ${isCollapsed ? 'md:w-[72px]' : 'md:w-[384px]'}`}
    >
      {renderContent()}
    </aside>
  );
}

export { SidebarContent };
