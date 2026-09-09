import { useRef, useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

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

  function renderButtonIcon() {
    if (!isCopied) return <Copy className="h-4 w-4" />;
    return <Check className="h-4 w-4" />;
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
      {renderButtonIcon()}
      <motion.span
        key={isCopied ? 'copiado' : 'copiar'}
        initial={{ opacity: 0, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -2 }}
        transition={{ duration: 0.1 }}
      >
        {isCopied ? 'Copiado' : 'Copiar'}
      </motion.span>
    </Button>
  );
}

export { CopyButton };
export type { CopyButtonProps };
