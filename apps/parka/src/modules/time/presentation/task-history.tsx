import { useEffect, useId, useState } from 'react';
import { Bot, ChevronDown, History, TriangleAlert } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatCommentTime } from '../domain/comment-time';
import { describeHistory } from '../domain/history-label';
import type { TaskHistoryEntry, TaskId } from '../domain/models';
import { fetchHistory } from '../integration/history';

/** Read-only trail of a task, loaded when opened and refreshed on every reopen. */
export const TaskHistory = ({ taskId }: { taskId: TaskId }) => {
  const panel = useId();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<TaskHistoryEntry[]>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open) return;
    let current = true;
    fetchHistory(taskId).then(
      (result) => {
        if (!current) return;
        setFailed(false);
        setItems(result);
      },
      () => current && setFailed(true),
    );
    return () => {
      current = false;
    };
  }, [taskId, open, attempt]);

  return (
    <section
      aria-label="Historia zmian"
      data-e2e="time:history"
      className="flex flex-col gap-2"
    >
      <button
        type="button"
        data-e2e="time:history-toggle"
        aria-expanded={open}
        aria-controls={panel}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center justify-between gap-2 rounded-md text-xs font-semibold text-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span className="flex items-center gap-1.5">
          <History className="h-3.5 w-3.5" aria-hidden="true" />
          Historia zmian
          {items ? ` (${items.length})` : null}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform motion-reduce:transition-none',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div
          id={panel}
          className="flex animate-pop-in flex-col gap-2 motion-reduce:animate-none"
        >
          {failed && !items ? (
            <div
              role="alert"
              data-e2e="time:history-error"
              className="flex flex-col items-start gap-1 rounded-xl border border-danger-line bg-danger-soft p-3 text-sm"
            >
              <p className="flex items-center gap-1.5 font-semibold">
                <TriangleAlert
                  className="h-4 w-4 text-danger"
                  aria-hidden="true"
                />
                Nie udało się wczytać historii
              </p>
              <p className="font-mono text-xs text-danger">HISTORY_LOAD</p>
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
              data-e2e="time:history-skeleton"
              className="flex flex-col gap-2"
            >
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              data-e2e="time:history-empty"
              variant="card"
              icon={History}
              title="Brak historii"
              description="Zmiany tego zadania pojawią się tutaj."
            />
          ) : (
            <ol
              aria-label="Zdarzenia"
              tabIndex={0}
              className="flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {items.map((entry) => (
                <li
                  key={entry.id}
                  data-e2e={`time:history-entry:${entry.id}`}
                  className="flex flex-col gap-0.5 rounded-xl border border-line-strong bg-card px-3 py-2 text-sm"
                >
                  <p className="min-w-0 break-words">
                    {describeHistory(entry)}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-soft">
                    <time dateTime={entry.at}>
                      {formatCommentTime(entry.at)}
                    </time>
                    {entry.bot ? (
                      <span
                        title={`Zmiana przez token MCP, identyfikator ${entry.bot.ref}`}
                        className="inline-flex items-center gap-1 rounded-full bg-track px-1.5 py-0.5"
                      >
                        <Bot className="h-3 w-3" aria-hidden="true" />
                        {entry.bot.name} · #{entry.bot.ref}
                      </span>
                    ) : null}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : null}
    </section>
  );
};
