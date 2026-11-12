import {
  closeModal,
  openModal,
  replaceModal,
  useModalMounted,
  useModalStack,
} from '@/shared/router/modal-stack';

const PREFIX = 'popover:';

/**
 * Open state of every popover, menu and select, on every screen size. It
 * lives in the URL modal stack (one history entry), so Back closes just the
 * popover, Forward reopens it, it stacks with modals and a reload restores
 * it. `key` must be stable.
 */
export const usePopoverOpen = (key: string) => {
  const id = `${PREFIX}${key}`;
  const stack = useModalStack();
  const open = stack.includes(id);
  useModalMounted(id, open);

  return {
    open,
    setOpen: (next: boolean) => (next ? openModal(id) : closeModal(id)),
    /**
     * Closes the popover and opens `modal` in its place. Never chain
     * `setOpen(false)` with `openModal`: closing steps Back asynchronously
     * and would undo the modal just pushed.
     */
    openModal: (modal: string) => replaceModal(id, modal),
  };
};
