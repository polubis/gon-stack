import { useEffect, useEffectEvent, useRef, useState } from 'react';
import {
  FileText,
  Loader2,
  Play,
  Paperclip,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react';
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_COUNT,
  attachmentRejection,
  formatFileSize,
  isImageMime,
  isVideoMime,
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
  watchAttachments,
  type AttachmentEvent,
} from '../integration/attachments';
import { AttachmentViewer } from './attachment-viewer';
import { useContext } from './context';
import { DeleteDialog } from './delete-dialog';
import { VideoTrimDialog } from './video-trim-dialog';
import {
  TRIM_ATTACHMENT_MODAL,
  deleteAttachmentModal,
  deletedAttachmentIdOf,
  viewAttachmentModal,
  viewedAttachmentIdOf,
} from './modal-ids';

const Thumb = ({ item }: { item: Attachment }) =>
  item.status === 'uploading' ? (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
      <Loader2
        className="h-5 w-5 animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
    </span>
  ) : item.status === 'failed' ? (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-danger-soft text-danger">
      <TriangleAlert className="h-5 w-5" aria-hidden="true" />
    </span>
  ) : isVideoMime(item.mime) ? (
    <button
      type="button"
      data-e2e={`time:attachment-thumb:${item.id}`}
      aria-label={`Otwórz wideo: ${item.name}`}
      onClick={() => openModal(viewAttachmentModal(item.id))}
      className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-track focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <video
        src={`${API_ROUTER.timeAttachmentById(item.id)}#t=0.1`}
        preload="metadata"
        muted
        playsInline
        tabIndex={-1}
        aria-hidden="true"
        className="h-full w-full object-cover"
      />
      <Play
        className="absolute inset-0 m-auto h-4 w-4 text-on-brand drop-shadow"
        aria-hidden="true"
      />
    </button>
  ) : isImageMime(item.mime) ? (
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
  const [sending, setSending] = useState<
    { key: string; name: string; percent: number }[]
  >([]);
  const cancels = useRef(new Map<string, AbortController>());
  const [trim, setTrim] = useState<{
    file: File;
    resolve: (file: File | null) => void;
  }>();

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

  /** Tells how a video that was still saving ended. */
  const announce = (before: Attachment | undefined, next: Attachment) => {
    if (before?.status !== 'uploading') return;
    if (next.status === 'ready')
      notify({
        tone: 'success',
        message: `Wideo „${next.name}” jest gotowe`,
        action: {
          label: 'Otwórz',
          run: () => openModal(viewAttachmentModal(next.id)),
        },
      });
    else if (next.status === 'failed')
      notify({
        tone: 'error',
        title: `Nie zapisano pliku „${next.name}”`,
        code: 'ATTACHMENT_STORE',
        description: 'Serwer nie zapisał pliku. Usuń go i dodaj ponownie.',
      });
  };

  const onEvent = useEffectEvent((event: AttachmentEvent) => {
    if (event.type === 'DELETE') {
      setItems((current) => current?.filter((item) => item.id !== event.id));
      return;
    }
    const next = event.attachment;
    if (!next || event.taskId !== taskId) return;
    const before = items?.find((item) => item.id === next.id);
    setItems((current) =>
      current?.some((item) => item.id === next.id)
        ? current.map((item) => (item.id === next.id ? next : item))
        : [...(current ?? []), next],
    );
    announce(before, next);
  });
  // Events missed while offline are gone: load the list again on (re)connect.
  const onOpen = useEffectEvent(() => {
    fetchAttachments(taskId).then(
      (loaded) => {
        loaded.forEach((next) =>
          announce(
            items?.find((item) => item.id === next.id),
            next,
          ),
        );
        setItems(loaded);
      },
      () => {},
    );
  });
  useEffect(() => watchAttachments(onEvent, onOpen), []);

  // Back (or a stale deep link) leaves the trim step: drop the picked video.
  useEffect(() => {
    const open = stack.includes(TRIM_ATTACHMENT_MODAL);
    if (open && !trim) closeModal(TRIM_ATTACHMENT_MODAL);
    // A promise settles once: resolving a finished trim again is harmless.
    if (!open && trim) trim.resolve(null);
  }, [stack, trim]);

  const askTrim = (file: File) =>
    new Promise<File | null>((resolve) => {
      setTrim({ file, resolve });
      openModal(TRIM_ATTACHMENT_MODAL);
    });

  const upload = async (files: File[]) => {
    setUploading(true);
    let count = items?.length ?? 0;
    for (const picked of files) {
      const first = attachmentRejection(picked);
      const file =
        first === null && isVideoMime(picked.type)
          ? await askTrim(picked)
          : picked;
      if (!file) continue;
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
      const key = crypto.randomUUID();
      const progress = (percent: number) =>
        setSending((current) =>
          current.map((entry) =>
            entry.key === key ? { ...entry, percent } : entry,
          ),
        );
      const controller = new AbortController();
      cancels.current.set(key, controller);
      setSending((current) => [
        ...current,
        { key, name: file.name, percent: 0 },
      ]);
      try {
        const { originalSize, ...added } = await postAttachment(
          taskId,
          file,
          progress,
          controller.signal,
        );
        count += 1;
        setItems((current) =>
          current?.some((item) => item.id === added.id)
            ? current
            : [...(current ?? []), added],
        );
        if (added.status === 'uploading') continue;
        notify({
          tone: 'success',
          message:
            added.size < originalSize
              ? `Dodano „${added.name}”, zmniejszono z ${formatFileSize(originalSize)} do ${formatFileSize(added.size)}`
              : `Dodano plik „${added.name}”`,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          notify({
            tone: 'success',
            message: `Anulowano wysyłanie „${file.name}”`,
          });
          continue;
        }
        notify({
          tone: 'error',
          title: `Nie dodano pliku „${file.name}”`,
          code: 'ATTACHMENT_UPLOAD',
          description: `Nie udało się wysłać pliku${error instanceof Error ? ` (${error.message})` : ''}. Spróbuj ponownie.`,
          retry: () => void upload([file]),
        });
      } finally {
        cancels.current.delete(key);
        setSending((current) => current.filter((entry) => entry.key !== key));
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
      ) : items.length === 0 && sending.length === 0 ? (
        <EmptyState
          variant="card"
          icon={Paperclip}
          title="Brak załączników"
          description="Dodaj zdjęcie, wideo (do 20 MB), PDF lub plik tekstowy. Zdjęcia zostaną zmniejszone."
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
              {item.status === 'ready' ? (
                <a
                  data-e2e={`time:attachment-link:${item.id}`}
                  href={API_ROUTER.timeAttachmentById(item.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 truncate rounded-md font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {item.name}
                </a>
              ) : (
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {item.name}
                </span>
              )}
              <span
                className={
                  item.status === 'failed'
                    ? 'shrink-0 text-xs text-danger'
                    : 'shrink-0 text-xs text-ink-soft'
                }
              >
                {item.status === 'uploading'
                  ? 'Zapisywanie…'
                  : item.status === 'failed'
                    ? 'Błąd zapisu'
                    : formatFileSize(item.size)}
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
          {sending.map((entry) => (
            <li
              key={entry.key}
              className="flex items-center gap-2 rounded-xl border border-line-strong bg-card px-3 py-2 text-sm"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                <Loader2
                  className="h-5 w-5 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate font-semibold">{entry.name}</span>
                <progress
                  aria-label={`Wysyłanie pliku ${entry.name}`}
                  max={100}
                  value={entry.percent}
                  className="h-1.5 w-full accent-brand"
                />
              </div>
              <span className="shrink-0 text-xs text-ink-soft">
                {entry.percent}%
              </span>
              <button
                type="button"
                aria-label={`Anuluj wysyłanie pliku ${entry.name}`}
                onClick={() => cancels.current.get(entry.key)?.abort()}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-soft hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {trim && stack.includes(TRIM_ATTACHMENT_MODAL) ? (
        <VideoTrimDialog
          modal={TRIM_ATTACHMENT_MODAL}
          file={trim.file}
          onDone={(result) => {
            trim.resolve(result);
            setTrim(undefined);
          }}
        />
      ) : null}
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
