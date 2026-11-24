import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import {
  KNOWLEDGE_MEDIA_ACCEPT,
  knowledgeMediaRejection,
} from '@/shared/attachments/knowledge-media';
import { openModal } from '@/shared/router/modal-stack';
import { ExpandableTextarea } from '@/shared/ui/expandable-textarea';
import { Button, Field } from '@/shared/ui/controls';
import { Skeleton } from '@/shared/ui/skeleton';
import { REEL_MAX_LENGTH } from '../configuration/constraints';
import type { Reel, Topic } from '../domain/models';
import { useContext } from './context';
import { Markdown } from './markdown';
import { deleteModal, reelMediaDeleteModal } from './modal-ids';
import { ReelMediaView } from './reel-media';
import { ModalShell } from './modal-shell';

const ICON_BUTTON =
  'grid size-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

/** One reel: Markdown body, save when changed, move, delete (confirmed). */
const ReelEditor = ({
  reel,
  index,
  neighbours,
}: {
  reel: Reel;
  index: number;
  neighbours: { prev?: Reel; next?: Reel };
}) => {
  const { updateReel, uploadReelMedia, mediaBusy, notify } = useContext();
  const [body, setBody] = useState(reel.body);
  const [preview, setPreview] = useState(false);
  const [over, setOver] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  const busy = mediaBusy.includes(reel.id);
  const label = `Rolka ${index + 1}`;

  const pick = (file: File | undefined) => {
    if (!file || busy) return;
    const reason = knowledgeMediaRejection(file);
    if (reason)
      notify({
        tone: 'error',
        title: 'Nie można dodać pliku',
        code: 'KNOWLEDGE_REEL_MEDIA_REJECTED',
        description: reason,
      });
    else uploadReelMedia(reel.id, file);
  };
  const drop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    pick(event.dataTransfer.files[0]);
  };
  const dirty = body.trim() !== reel.body && body.trim() !== '';
  const move = (target?: Reel) =>
    target && updateReel({ ...reel, position: target.position });
  return (
    <li
      data-e2e={`knowledge:reel:${reel.id}`}
      className="flex flex-col gap-2 rounded-2xl border border-line p-3"
    >
      <div
        data-e2e={`knowledge:reel-media:${reel.id}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={drop}
        className={cn(
          'relative flex flex-col gap-2 rounded-2xl border border-dashed border-line p-2 transition-colors motion-reduce:transition-none',
          over && 'border-brand bg-brand-soft',
        )}
      >
        {reel.media ? (
          <div className="relative">
            <ReelMediaView
              media={reel.media}
              label={`Podgląd mediów rolki ${index + 1}`}
            />
            {busy ? (
              <span
                role="status"
                className="absolute inset-0 grid place-items-center rounded-2xl bg-overlay text-on-hero"
              >
                <LoaderCircle
                  className="size-6 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                <span className="sr-only">Wysyłanie pliku</span>
              </span>
            ) : null}
          </div>
        ) : (
          <p className="px-1 text-xs text-ink-soft">
            Przeciągnij obraz lub wideo tutaj albo wybierz plik.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={picker}
            type="file"
            hidden
            data-e2e={`knowledge:reel-upload:${reel.id}`}
            accept={KNOWLEDGE_MEDIA_ACCEPT}
            aria-label={`Plik rolki ${index + 1}`}
            onChange={(e) => {
              pick(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <Button
            variant="ghost"
            className="w-auto px-3 py-2"
            disabled={busy}
            onClick={() => picker.current?.click()}
          >
            {busy ? (
              <LoaderCircle
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <ImagePlus className="size-4" aria-hidden="true" />
            )}
            {reel.media ? 'Zmień plik' : 'Dodaj plik'}
            <span className="sr-only"> rolki {index + 1}</span>
          </Button>
          {reel.media ? (
            <button
              type="button"
              disabled={busy}
              aria-label={`Usuń media rolki ${index + 1}`}
              data-e2e={`knowledge:reel-media-remove:${reel.id}`}
              onClick={() => openModal(reelMediaDeleteModal(reel.id))}
              className={ICON_BUTTON}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
      <Field label={label}>
        {preview ? (
          <div
            data-e2e={`knowledge:reel-preview:${reel.id}`}
            className="max-h-64 overflow-y-auto rounded-2xl border border-line p-3"
          >
            <Markdown source={body} />
          </div>
        ) : (
          <ExpandableTextarea
            modal={`reel-editor:${reel.id}`}
            title={`Rolka ${index + 1}`}
            data-e2e={`knowledge:reel-body:${reel.id}`}
            rows={4}
            value={body}
            maxLength={REEL_MAX_LENGTH}
            label={label}
            onChange={(e) => setBody(e.target.value)}
          />
        )}
      </Field>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`Przesuń rolkę ${index + 1} wyżej`}
          data-e2e={`knowledge:reel-up:${reel.id}`}
          disabled={!neighbours.prev}
          onClick={() => move(neighbours.prev)}
          className={ICON_BUTTON}
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Przesuń rolkę ${index + 1} niżej`}
          data-e2e={`knowledge:reel-down:${reel.id}`}
          disabled={!neighbours.next}
          onClick={() => move(neighbours.next)}
          className={ICON_BUTTON}
        >
          <ArrowDown className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Usuń rolkę ${index + 1}`}
          data-e2e={`knowledge:reel-delete:${reel.id}`}
          onClick={() => openModal(deleteModal('reel', reel.id))}
          className={ICON_BUTTON}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-pressed={preview}
          aria-label={`Podgląd Markdown rolki ${index + 1}`}
          onClick={() => setPreview((value) => !value)}
          className={ICON_BUTTON}
        >
          {preview ? (
            <Pencil className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
        <Button
          className="ml-auto w-auto px-3 py-2"
          disabled={!dirty}
          data-e2e={`knowledge:reel-save:${reel.id}`}
          aria-label={`Zapisz rolkę ${index + 1}`}
          onClick={() => updateReel({ ...reel, body: body.trim() })}
        >
          <Save className="size-4" aria-hidden="true" /> Zapisz
        </Button>
      </div>
    </li>
  );
};

/** Editor of the reels of a topic: Markdown text with live preview, picture or clip (pick or drop). */
export const ReelsDialog = ({
  modal,
  topic,
}: {
  modal: string;
  topic: Topic;
}) => {
  const { reels, loadReels, createReel } = useContext();
  const [draft, setDraft] = useState('');
  const own = reels[topic.id];
  const id = topic.id;

  useEffect(() => {
    loadReels(id);
  }, [loadReels, id]);

  const add = (event: FormEvent) => {
    event.preventDefault();
    if (draft.trim() === '') return;
    createReel(topic.id, draft.trim());
    setDraft('');
  };

  return (
    <ModalShell
      modal={modal}
      data-e2e="knowledge:reels-dialog"
      title={`Rolki: ${topic.title}`}
      description="Kolejne porcje wiedzy w Markdown."
    >
      <div className="flex flex-col gap-3">
        {own === undefined ? (
          <div aria-hidden="true" className="flex flex-col gap-2">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {own.map((reel, index) => (
              <ReelEditor
                key={reel.id}
                reel={reel}
                index={index}
                neighbours={{ prev: own[index - 1], next: own[index + 1] }}
              />
            ))}
          </ul>
        )}
        <form onSubmit={add} className="flex flex-col gap-2" noValidate>
          <Field label="Nowa rolka" required>
            <ExpandableTextarea
              modal="reel-editor-new"
              title="Nowa rolka"
              data-e2e="knowledge:reel-body"
              rows={4}
              value={draft}
              maxLength={REEL_MAX_LENGTH}
              label="Nowa rolka"
              placeholder="Treść w Markdown"
              onChange={(e) => setDraft(e.target.value)}
            />
          </Field>
          <Button
            type="submit"
            data-e2e="knowledge:reel-add"
            disabled={draft.trim() === ''}
            className="w-auto self-end px-3 py-2"
          >
            <Plus className="size-4" aria-hidden="true" /> Dodaj rolkę
          </Button>
        </form>
      </div>
    </ModalShell>
  );
};
