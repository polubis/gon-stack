import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { formatFileSize } from '@/shared/attachments/rules';
import { API_ROUTER } from '@/shared/router/routes';
import { closeModal, useModalMounted } from '@/shared/router/modal-stack';
import type { Attachment } from '../domain/models';

/**
 * Full-screen view of an image attachment, stacked over the task details.
 * Radix traps focus inside, closes on Esc and returns focus to the thumbnail.
 */
export const AttachmentViewer = ({
  modal,
  attachment,
}: {
  /** Its id in the URL modal stack. */
  modal: string;
  attachment: Attachment;
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
        <Dialog.Content
          data-e2e="time:attachment-viewer"
          className="fixed inset-0 z-(--z-modal) flex animate-view-enter flex-col bg-surface motion-reduce:animate-none focus:outline-none"
        >
          <div className="flex items-center gap-3 border-b border-line-strong bg-card px-4 py-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate text-sm font-semibold">
                {attachment.name}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-ink-soft">
                {formatFileSize(attachment.size)}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Zamknij podgląd"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center p-2 sm:p-4">
            <img
              src={API_ROUTER.timeAttachmentById(attachment.id)}
              alt={attachment.name}
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
