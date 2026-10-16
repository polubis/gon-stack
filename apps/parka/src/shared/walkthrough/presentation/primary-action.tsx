import { ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/controls';
import { useContext } from './context';

export const PrimaryAction = () => {
  const ctx = useContext();
  const step = ctx.useActiveStep();
  const isLastStep = ctx.useIsLastStep();

  if (!step) {
    return null;
  }

  return (
    <Button data-e2e="walkthrough:primary" onClick={ctx.next}>
      {step.cta}
      {isLastStep ? null : (
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
};
