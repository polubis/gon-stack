import { Button } from '@/shared/ui/controls';
import { useContext } from './context';

type SkipActionProps = {
  label?: string;
};

export const SkipAction = ({ label = 'Pomiń' }: SkipActionProps) => {
  const ctx = useContext();

  return (
    <Button variant="ghost" data-e2e="walkthrough:skip" onClick={ctx.skip}>
      {label}
    </Button>
  );
};
