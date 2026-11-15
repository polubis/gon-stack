import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { closeModal, useModalMounted } from '@/shared/router/modal-stack';
import type { KnowledgeE2eId } from '../configuration/e2e-ids';

/**
 * Popup frame of the knowledge forms: title, scrolling body and a footer that
 * stays pinned, so the actions never leave the screen. URL-stack aware.
 */
export const ModalFrame = ({
  modal,
  title,
  description,
  footer,
  children,
  'data-e2e': dataE2e,
}: {
  /** Its id in the URL modal stack. */
  modal: string;
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
  'data-e2e': KnowledgeE2eId;
}) => {
  useModalMounted(modal);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) closeModal(modal);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Content
          data-e2e={dataE2e}
          onOpenAutoFocus={(e) => {
            // Focus the dialog itself: no mobile keyboard pops up.
            e.preventDefault();
            if (e.target instanceof HTMLElement) e.target.focus();
          }}
          className="fixed inset-x-4 bottom-[calc(var(--kb-inset,0rem)+1rem)] z-(--z-modal) mx-auto flex max-h-[calc(100dvh-var(--kb-inset,0rem)-2rem)] max-w-md animate-pop-in flex-col overflow-hidden rounded-4xl border border-line bg-card shadow-popover focus:outline-none motion-reduce:animate-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
        >
          <div className="flex items-center gap-3 px-5 pb-3 pt-5">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate text-base font-semibold">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 break-words text-xs text-ink-soft">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close
              data-e2e={`knowledge:modal-close:${modal}`}
              aria-label="Zamknij"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-4">
            {children}
          </div>
          <div className="flex gap-2 border-t border-line bg-card px-5 py-3">
            {footer}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
