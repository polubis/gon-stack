import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/controls';
import { useContext } from './context';

export const PrevAction = () => {
  const ctx = useContext();

  return (
    <Button variant="ghost" data-e2e="walkthrough:prev" onClick={ctx.prev}>
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Wstecz
    </Button>
  );
};
