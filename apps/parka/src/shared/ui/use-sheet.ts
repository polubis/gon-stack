import { useRef } from 'react';
import {
  closeModal,
  openModal,
  useModalMounted,
  useModalStack,
} from '@/shared/router/modal-stack';

const PREFIX = 'sheet:';

/**
 * Which sheet is open on a card, kept in the URL modal stack. Closing
 * returns focus to its opener.
 */
export const useSheet = <Kind extends string>() => {
  const stack = useModalStack();
  const opener = useRef<HTMLElement | null>(null);
  const id = stack.findLast((entry) => entry.startsWith(PREFIX)) ?? null;
  const sheet = id ? (id.slice(PREFIX.length) as Kind) : null;
  useModalMounted(id ?? PREFIX, id !== null);

  return {
    sheet,
    open: (kind: Kind) => {
      opener.current = document.activeElement as HTMLElement | null;
      openModal(`${PREFIX}${kind}`);
    },
    close: () => {
      if (id) closeModal(id);
      opener.current?.focus();
    },
  };
};
