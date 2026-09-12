import { Button } from '@/modules/shared/ui';
import { useContext } from './context';

export const PrimaryAction = () => {
  const ctx = useContext();
  const step = ctx.useActiveStep();

  if (!step) {
    return null;
  }

  return (
    <Button data-e2e="walkthrough:primary" onClick={ctx.next}>
      {step.cta}
    </Button>
  );
};
