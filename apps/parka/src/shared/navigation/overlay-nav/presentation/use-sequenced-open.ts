import { useEffect } from 'react';
import { setIntent, useStage } from './nav-sequence';

/**
 * Holds a popover back until the nav and the add button finished moving (see
 * nav-sequence). While it waits, another click on the trigger cancels it.
 * Spread the result on `Popover.Root`.
 */
export const useSequencedOpen = (
  id: string,
  open: boolean,
  setOpen: (next: boolean) => void,
) => {
  const ready = useStage() === 'ready';

  useEffect(() => {
    setIntent(id, open);
    return () => setIntent(id, false);
  }, [id, open]);

  const shown = open && ready;
  return {
    open: shown,
    onOpenChange: (next: boolean) => setOpen(shown ? next : !open),
  };
};
