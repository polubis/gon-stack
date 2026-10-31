import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  MessageSquare,
  Pencil,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import {
  closeModal,
  openModal,
  useModalStack,
} from '@/shared/router/modal-stack';
import { Button, inputClass } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { COMMENT_MAX_LENGTH } from '../configuration/constraints';
import { formatCommentTime } from '../domain/comment-time';
import type { CommentOwner, TaskComment, TaskId } from '../domain/models';
import {
  fetchComments,
  postComment,
  putComment,
  removeComment,
} from '../integration/comments';
import { CommentAvatar } from './comment-avatar';
import { useContext } from './context';
import { DeleteDialog } from './delete-dialog';
import { deleteCommentModal, deletedCommentIdOf } from './modal-ids';

const PENDING = 'pending:';

const isPending = (comment: TaskComment) => comment.id.startsWith(PENDING);

/** Who signed it: the owner, the bot (with its token ref) or both after an owner edit. */
const authorOf = (comment: TaskComment, owner: CommentOwner): string =>
  !comment.bot
    ? owner.name
    : comment.editedAt
      ? `${owner.name} + ${comment.bot.name}`
      : comment.bot.name;

type EditorProps = {
  initial: string;
  label: string;
  submitLabel: string;
  onSubmit: (body: string) => void;
  onCancel: () => void;
};

/** Textarea with counter; Ctrl/Cmd+Enter saves, Escape cancels. */
const Editor = ({
  initial,
  label,
  submitLabel,
  onSubmit,
  onCancel,
}: EditorProps) => {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLTextAreaElement>(null);
  const trimmed = value.trim();
  const canSave = trimmed !== '' && trimmed !== initial.trim();

  useEffect(() => {
    const el = ref.current;
    el?.focus();
    el?.setSelectionRange(el.value.length, el.value.length);
  }, []);

  return (
    <form
      data-e2e="time:comment-form"
      data-owns-escape=""
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSave) onSubmit(trimmed);
      }}
    >
      <textarea
        ref={ref}
        data-e2e="time:comment-input"
        aria-label={label}
        value={value}
        rows={3}
        maxLength={COMMENT_MAX_LENGTH}
        className={cn(inputClass, 'resize-y')}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onCancel();
          } else if (
            event.key === 'Enter' &&
            (event.ctrlKey || event.metaKey) &&
            canSave
          ) {
            event.preventDefault();
            onSubmit(trimmed);
          }
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs tabular-nums text-ink-soft">
          {value.length}/{COMMENT_MAX_LENGTH}
          <span className="sr-only"> znaków</span>
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="w-auto px-3 py-1.5 text-xs"
            data-e2e="time:comment-cancel"
            onClick={onCancel}
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            className="w-auto px-3 py-1.5 text-xs"
            data-e2e="time:comment-save"
            disabled={!canSave}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
};

const Item = ({
  comment,
  owner,
  editing,
  onEdit,
  onCancelEdit,
  onSave,
}: {
  comment: TaskComment;
  owner: CommentOwner;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (body: string) => void;
}) => {
  const pending = isPending(comment);
  const author = authorOf(comment, owner);
  return (
    <li
      data-e2e={`time:comment:${comment.id}`}
      aria-busy={pending}
      className={cn(
        'flex gap-2 rounded-xl border border-line-strong bg-card px-3 py-2 text-sm',
        pending && 'opacity-60',
      )}
    >
      <CommentAvatar
        comment={comment}
        owner={owner}
        data-e2e={`time:comment-avatar:${comment.id}`}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span
            data-e2e={`time:comment-author:${comment.id}`}
            className="min-w-0 break-words text-xs font-semibold"
          >
            {author}
          </span>
          {comment.bot ? (
            <span
              title={`Dodano przez token MCP, identyfikator ${comment.bot.ref}`}
              className="inline-flex items-center gap-1 rounded-full bg-track px-1.5 py-0.5 text-xs text-ink-soft"
            >
              <Bot className="h-3 w-3" aria-hidden="true" />
              Bot MCP · #{comment.bot.ref}
            </span>
          ) : null}
          <time
            data-e2e={`time:comment-time:${comment.id}`}
            dateTime={comment.createdAt}
            className="text-xs text-ink-soft"
          >
            {pending ? 'Zapisywanie…' : formatCommentTime(comment.createdAt)}
          </time>
          {comment.editedAt ? (
            <span className="text-xs text-ink-soft">(edytowano)</span>
          ) : null}
        </div>
        {editing ? (
          <Editor
            initial={comment.body}
            label="Treść komentarza"
            submitLabel="Zapisz"
            onSubmit={onSave}
            onCancel={onCancelEdit}
          />
        ) : (
          <p className="whitespace-pre-wrap break-words">{comment.body}</p>
        )}
      </div>
      {editing || pending ? null : (
        <div className="flex shrink-0 items-start gap-0.5">
          <button
            type="button"
            data-e2e={`time:comment-edit:${comment.id}`}
            aria-label={`Edytuj komentarz: ${author}, ${formatCommentTime(comment.createdAt)}`}
            onClick={onEdit}
            className="grid h-8 w-8 place-items-center rounded-md text-ink-soft hover:bg-brand-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            data-e2e={`time:comment-delete:${comment.id}`}
            aria-label={`Usuń komentarz: ${author}, ${formatCommentTime(comment.createdAt)}`}
            onClick={() => openModal(deleteCommentModal(comment.id))}
            className="grid h-8 w-8 place-items-center rounded-md text-danger hover:bg-danger-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </li>
  );
};

/** Optional notes under a task: list, add, edit and delete (after a confirmation). */
export const TaskComments = ({ taskId }: { taskId: TaskId }) => {
  const { notify } = useContext();
  const stack = useModalStack();
  const [loaded, setLoaded] = useState<{
    owner: CommentOwner;
    items: TaskComment[];
  }>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [composing, setComposing] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const counter = useRef(0);

  const items = loaded?.items;
  const patch = (update: (current: TaskComment[]) => TaskComment[]) =>
    setLoaded((state) => state && { ...state, items: update(state.items) });

  useEffect(() => {
    let current = true;
    fetchComments(taskId).then(
      (result) => current && setLoaded(result),
      () => current && setFailed(true),
    );
    return () => {
      current = false;
    };
  }, [taskId, attempt]);

  // A deep link to a comment that is gone must not leave a dead `modal=` param.
  useEffect(() => {
    if (!items) return;
    for (const modal of stack) {
      const id = deletedCommentIdOf(modal);
      if (id !== null && !items.some((item) => item.id === id))
        closeModal(modal);
    }
  }, [items, stack]);

  const add = async (body: string) => {
    const tempId = `${PENDING}${++counter.current}`;
    setComposing(false);
    patch((current) => [
      ...current,
      {
        id: tempId,
        body,
        createdAt: new Date().toISOString(),
        editedAt: null,
        bot: null,
      },
    ]);
    try {
      const saved = await postComment(taskId, body);
      patch((current) => current.map((c) => (c.id === tempId ? saved : c)));
      notify({ tone: 'success', message: 'Dodano komentarz' });
    } catch (error) {
      patch((current) => current.filter((c) => c.id !== tempId));
      notify({
        tone: 'error',
        title: 'Nie dodano komentarza',
        code: 'COMMENT_CREATE',
        description: `Nie udało się zapisać komentarza${error instanceof Error ? ` (${error.message})` : ''}. Spróbuj ponownie.`,
        retry: () => void add(body),
      });
    }
  };

  const save = async (comment: TaskComment, body: string) => {
    setEditingId(undefined);
    patch((current) =>
      current.map((c) =>
        c.id === comment.id
          ? { ...c, body, editedAt: new Date().toISOString() }
          : c,
      ),
    );
    try {
      const saved = await putComment(comment.id, body);
      patch((current) => current.map((c) => (c.id === comment.id ? saved : c)));
      notify({ tone: 'success', message: 'Zapisano komentarz' });
    } catch (error) {
      patch((current) =>
        current.map((c) => (c.id === comment.id ? comment : c)),
      );
      notify({
        tone: 'error',
        title: 'Nie zapisano komentarza',
        code: 'COMMENT_UPDATE',
        description: `Nie udało się zapisać zmian${error instanceof Error ? ` (${error.message})` : ''}. Spróbuj ponownie.`,
        retry: () => void save(comment, body),
      });
    }
  };

  const remove = async (comment: TaskComment) => {
    const before = items ?? [];
    patch((current) => current.filter((c) => c.id !== comment.id));
    try {
      await removeComment(comment.id);
      notify({ tone: 'success', message: 'Usunięto komentarz' });
    } catch {
      patch(() => before);
      notify({
        tone: 'error',
        title: 'Nie usunięto komentarza',
        code: 'COMMENT_DELETE',
        description: 'Nie udało się usunąć komentarza. Spróbuj ponownie.',
        retry: () => void remove(comment),
      });
    }
  };

  const deletingId = stack
    .map(deletedCommentIdOf)
    .find((id): id is string => id !== null);
  const deleting = items?.find((item) => item.id === deletingId);
  const addButton = (
    <Button
      variant="ghost"
      className="w-auto px-3 py-1.5 text-xs"
      data-e2e="time:comment-add"
      disabled={!items}
      onClick={() => setComposing(true)}
    >
      Dodaj komentarz
    </Button>
  );

  return (
    <section
      aria-label="Komentarze"
      data-e2e="time:comments"
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
          <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
          Komentarze
          {items ? ` (${items.length})` : null}
        </h4>
        {composing || items?.length === 0 ? null : addButton}
      </div>

      {failed ? (
        <div
          role="alert"
          data-e2e="time:comments-error"
          className="flex flex-col items-start gap-1 rounded-xl border border-danger-line bg-danger-soft p-3 text-sm"
        >
          <p className="flex items-center gap-1.5 font-semibold">
            <TriangleAlert className="h-4 w-4 text-danger" aria-hidden="true" />
            Nie udało się wczytać komentarzy
          </p>
          <p className="font-mono text-xs text-danger">COMMENTS_LOAD</p>
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
      ) : !loaded ? (
        <div data-e2e="time:comments-skeleton" className="flex flex-col gap-2">
          <Skeleton className="h-14 w-full" />
        </div>
      ) : (
        <>
          {loaded.items.length === 0 && !composing ? (
            <EmptyState
              data-e2e="time:comments-empty"
              variant="card"
              icon={MessageSquare}
              title="Brak komentarzy"
              description="Dodaj notatkę do tego zadania. Komentarze są opcjonalne."
              action={addButton}
            />
          ) : null}
          {loaded.items.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {loaded.items.map((comment) => (
                <Item
                  key={comment.id}
                  comment={comment}
                  owner={loaded.owner}
                  editing={editingId === comment.id}
                  onEdit={() => setEditingId(comment.id)}
                  onCancelEdit={() => setEditingId(undefined)}
                  onSave={(body) => void save(comment, body)}
                />
              ))}
            </ul>
          ) : null}
          {composing ? (
            <Editor
              initial=""
              label="Nowy komentarz"
              submitLabel="Dodaj"
              onSubmit={(body) => void add(body)}
              onCancel={() => setComposing(false)}
            />
          ) : null}
        </>
      )}

      {deleting ? (
        <DeleteDialog
          modal={deleteCommentModal(deleting.id)}
          task={{ title: deleting.body }}
          title="Usunąć komentarz?"
          description="Komentarz zostanie usunięty bez możliwości cofnięcia."
          onConfirm={() => {
            closeModal(deleteCommentModal(deleting.id));
            void remove(deleting);
          }}
        />
      ) : null}
    </section>
  );
};
