import { useRef, useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CopyButtonProps {
  content: string;
}
function CopyButton({ content }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isContentEmpty = !content.trim();

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  async function handleCopy() {
    const text = content.trim();

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);

      clearTimer();

      timerRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      const _error = error as Error;
      toast.error(`Erro ao copiar o texto: ${_error.message}`);
    }
  }

  function renderCopyButtonContent() {
    if (!isCopied)
      return (
        <>
          <Copy className="h-4 w-4" />
          <span>Copiar</span>
        </>
      );
    return (
      <>
        <span>Copiado</span>
        <Check className="h-4 w-4" />
      </>
    );
  }

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="disabled:opacity-50"
      disabled={isContentEmpty}
      onClick={handleCopy}
    >
      {renderCopyButtonContent()}
    </Button>
  );
}

export { CopyButton };
export type { CopyButtonProps };
