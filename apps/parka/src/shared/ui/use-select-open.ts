import { useState, useSyncExternalStore } from 'react';
import {
  closeModal,
  openModal,
  useModalMounted,
  useModalStack,
} from '@/shared/router/modal-stack';

const NARROW = '(max-width: 39.99rem)';
const PREFIX = 'select:';

const subscribe = (notify: () => void) => {
  const query = window.matchMedia?.(NARROW);
  query?.addEventListener('change', notify);
  return () => query?.removeEventListener('change', notify);
};

const isNarrow = () => window.matchMedia?.(NARROW).matches ?? false;

/**
 * Open state of a select-like field. Wide screens keep it local; narrow
 * ones keep it in the URL modal stack (one history entry), so Back closes
 * just the select and a reload restores it. `key` must be stable.
 */
export const useSelectOpen = (key: string) => {
  const id = `${PREFIX}${key}`;
  const narrow = useSyncExternalStore(subscribe, isNarrow, () => false);
  const stack = useModalStack();
  const [local, setLocal] = useState(false);
  const open = narrow ? stack.includes(id) : local;
  useModalMounted(id, narrow && open);

  return {
    open,
    setOpen: (next: boolean) => {
      if (!narrow) setLocal(next);
      else if (next) openModal(id);
      else closeModal(id);
    },
  };
};
