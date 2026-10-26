import { useEffect, useRef, useState } from 'react';
import {
  FileText,
  Loader2,
  Paperclip,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_COUNT,
  attachmentRejection,
  formatFileSize,
  isImageMime,
} from '@/shared/attachments/rules';
import { API_ROUTER } from '@/shared/router/routes';
import {
  closeModal,
  openModal,
  useModalStack,
} from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import type { Attachment, TaskId } from '../domain/models';
import {
  fetchAttachments,
  postAttachment,
  removeAttachment,
} from '../integration/attachments';
import { AttachmentViewer } from './attachment-viewer';
import { useContext } from './context';
import { DeleteDialog } from './delete-dialog';
import {
  deleteAttachmentModal,
  deletedAttachmentIdOf,
  viewAttachmentModal,
  viewedAttachmentIdOf,
} from './modal-ids';

const Thumb = ({ item }: { item: Attachment }) =>
  isImageMime(item.mime) ? (
    <button
      type="button"
      data-e2e={`time:attachment-thumb:${item.id}`}
      aria-label={`Otwórz podgląd: ${item.name}`}
      onClick={() => openModal(viewAttachmentModal(item.id))}
      className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-track focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <img
        src={API_ROUTER.timeAttachmentById(item.id)}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </button>
  ) : (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
      <FileText className="h-5 w-5" aria-hidden="true" />
    </span>
  );

const selectedId = (
  stack: readonly string[],
  idOf: (modal: string) => string | null,
): string | undefined =>
  stack.map(idOf).find((id): id is string => id !== null);

/** Files of a task: list, thumbnails, open, add and delete (after a confirmation). */
export const TaskAttachments = ({ taskId }: { taskId: TaskId }) => {
  const { notify } = useContext();
  const stack = useModalStack();
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Attachment[]>();
  const [failed, setFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    fetchAttachments(taskId).then(
      (loaded) => current && setItems(loaded),
      () => current && setFailed(true),
    );
    return () => {
      current = false;
    };
  }, [taskId, attempt]);

  // A deep link to a file that is gone must not leave a dead `modal=` param.
  useEffect(() => {
    if (!items) return;
    for (const modal of stack) {
      const id = deletedAttachmentIdOf(modal) ?? viewedAttachmentIdOf(modal);
      if (id !== null && !items.some((item) => item.id === id))
        closeModal(modal);
    }
  }, [items, stack]);

  const upload = async (files: File[]) => {
    setUploading(true);
    let count = items?.length ?? 0;
    for (const file of files) {
      const reason =
        count >= ATTACHMENT_MAX_COUNT
          ? `Zadanie ma już maksymalnie ${ATTACHMENT_MAX_COUNT} załączników`
          : attachmentRejection(file);
      if (reason !== null) {
        notify({
          tone: 'error',
          title: `Nie dodano pliku „${file.name}”`,
          code: 'ATTACHMENT_REJECTED',
          description: reason,
        });
        continue;
      }
      try {
        const { originalSize, ...added } = await postAttachment(taskId, file);
        count += 1;
        setItems((current) => [...(current ?? []), added]);
        notify({
          tone: 'success',
          message:
            added.size < originalSize
              ? `Dodano „${added.name}”, zmniejszono z ${formatFileSize(originalSize)} do ${formatFileSize(added.size)}`
              : `Dodano plik „${added.name}”`,
        });
      } catch (error) {
        notify({
          tone: 'error',
          title: `Nie dodano pliku „${file.name}”`,
          code: 'ATTACHMENT_UPLOAD',
          description: `Nie udało się wysłać pliku${error instanceof Error ? ` (${error.message})` : ''}. Spróbuj ponownie.`,
          retry: () => void upload([file]),
        });
      }
    }
    setUploading(false);
  };

  const remove = async (item: Attachment) => {
    const before = items ?? [];
    setItems(before.filter((other) => other.id !== item.id));
    try {
      await removeAttachment(item.id);
      notify({ tone: 'success', message: `Usunięto plik „${item.name}”` });
    } catch {
      setItems(before);
      notify({
        tone: 'error',
        title: `Nie usunięto pliku „${item.name}”`,
        code: 'ATTACHMENT_DELETE',
        description: 'Nie udało się usunąć pliku. Spróbuj ponownie.',
        retry: () => void remove(item),
      });
    }
  };

  const deletingId = selectedId(stack, deletedAttachmentIdOf);
  const viewingId = selectedId(stack, viewedAttachmentIdOf);
  const deleting = items?.find((item) => item.id === deletingId);
  const viewing = items?.find((item) => item.id === viewingId);
  const full = (items?.length ?? 0) >= ATTACHMENT_MAX_COUNT;
  const addButton = (
    <Button
      variant="ghost"
      className="w-auto px-3 py-1.5 text-xs"
      data-e2e="time:attachment-add"
      disabled={uploading || full || !items}
      onClick={() => input.current?.click()}
    >
      {uploading ? (
        <Loader2
          className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : null}
      {uploading ? 'Wysyłanie…' : 'Dodaj plik'}
    </Button>
  );

  return (
    <section
      aria-label="Załączniki"
      data-e2e="time:attachments"
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
          <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
          Załączniki
          {items ? ` (${items.length}/${ATTACHMENT_MAX_COUNT})` : null}
        </h4>
        {items?.length === 0 && !uploading ? null : addButton}
        <input
          ref={input}
          type="file"
          multiple
          hidden
          tabIndex={-1}
          aria-label="Wybierz pliki"
          data-e2e="time:attachment-input"
          accept={ATTACHMENT_ACCEPT}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = '';
            if (files.length > 0) void upload(files);
          }}
        />
      </div>

      {failed ? (
        <div
          role="alert"
          data-e2e="time:attachments-error"
          className="flex flex-col items-start gap-1 rounded-xl border border-danger-line bg-danger-soft p-3 text-sm"
        >
          <p className="flex items-center gap-1.5 font-semibold">
            <TriangleAlert className="h-4 w-4 text-danger" aria-hidden="true" />
            Nie udało się wczytać załączników
          </p>
          <p className="font-mono text-xs text-danger">ATTACHMENTS_LOAD</p>
          <p className="text-ink-soft">
            Sprawdź połączenie i spróbuj jeszcze raz.
          </p>
          <Button
            variant="ghost"
            className="mt-1 w-auto px-3 py-1.5 text-xs"
            onClick={() => {
              setFailed(false);
              setAttempt((n) => n + 1);
            }}
          >
            Spróbuj ponownie
          </Button>
        </div>
      ) : !items ? (
        <div
          data-e2e="time:attachments-skeleton"
          className="flex flex-col gap-2"
        >
          <Skeleton className="h-14 w-full" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          variant="card"
          icon={Paperclip}
          title="Brak załączników"
          description="Dodaj zdjęcie, PDF lub plik tekstowy. Zdjęcia zostaną zmniejszone."
          action={addButton}
        />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              data-e2e={`time:attachment:${item.id}`}
              className="flex items-center gap-2 rounded-xl border border-line-strong bg-card px-3 py-2 text-sm"
            >
              <Thumb item={item} />
              <a
                href={API_ROUTER.timeAttachmentById(item.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate rounded-md font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {item.name}
              </a>
              <span className="shrink-0 text-xs text-ink-soft">
                {formatFileSize(item.size)}
              </span>
              <button
                type="button"
                data-e2e={`time:attachment-delete:${item.id}`}
                aria-label={`Usuń plik ${item.name}`}
                onClick={() => openModal(deleteAttachmentModal(item.id))}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-danger hover:bg-danger-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {viewing ? (
        <AttachmentViewer
          modal={viewAttachmentModal(viewing.id)}
          attachment={viewing}
        />
      ) : null}
      {deleting ? (
        <DeleteDialog
          modal={deleteAttachmentModal(deleting.id)}
          task={{ title: deleting.name }}
          title="Usunąć plik?"
          description={`Plik „${deleting.name}” zostanie usunięty bez możliwości cofnięcia.`}
          onConfirm={() => {
            closeModal(deleteAttachmentModal(deleting.id));
            void remove(deleting);
          }}
        />
      ) : null}
    </section>
  );
};
