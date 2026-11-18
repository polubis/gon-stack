import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  Film,
  RotateCcw,
  TriangleAlert,
  X,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { closeModal, useModalMounted } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { Skeleton } from '@/shared/ui/skeleton';
import { lessonOrder, neighbourLessons, resumeIndex } from '../domain/lessons';
import type { Reel, Topic, TopicId } from '../domain/models';
import { useContext } from './context';
import { Markdown } from './markdown';
import { ReelMediaView } from './reel-media';

/** Drag distances (in CSS px) that count as a swipe, and where the axis locks. */
const SWIPE_X = 60;
const SWIPE_Y = 80;
const AXIS_LOCK = 10;

type Motion = 'next' | 'prev' | 'lesson-next' | 'lesson-prev' | 'none';

const ENTER: Record<Motion, string> = {
  next: 'animate-reel-next',
  prev: 'animate-reel-prev',
  'lesson-next': 'animate-lesson-next',
  'lesson-prev': 'animate-lesson-prev',
  none: '',
};

const NAV_BUTTON =
  'grid size-11 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-hover disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';
const LESSON_BUTTON =
  'flex min-h-11 min-w-0 items-center gap-1 rounded-full px-3 text-xs font-medium text-ink-soft transition-colors hover:bg-hover disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

const atEdge = (el: HTMLElement | null, edge: 'top' | 'bottom'): boolean =>
  !el ||
  (edge === 'top'
    ? el.scrollTop <= 1
    : el.scrollTop + el.clientHeight >= el.scrollHeight - 1);

const Segments = ({
  reels,
  index,
}: {
  reels: readonly Reel[];
  index: number;
}) => (
  <ol aria-hidden="true" className="flex gap-1">
    {reels.map((reel, at) => (
      <li
        key={reel.id}
        data-e2e={`knowledge:viewer-segment:${reel.id}`}
        className={cn(
          'h-1 flex-1 rounded-full transition-colors motion-reduce:transition-none',
          at === index
            ? 'bg-brand'
            : reel.done || at < index
              ? 'bg-brand-soft'
              : 'bg-track-strong',
        )}
      />
    ))}
  </ol>
);

const ViewerSkeleton = () => (
  <div
    data-e2e="knowledge:viewer-skeleton"
    aria-hidden="true"
    className="mx-auto flex h-full w-full max-w-2xl flex-col gap-4 px-4 py-4"
  >
    <Skeleton className="h-48 w-full rounded-2xl" />
    <Skeleton className="h-6 w-2/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

/**
 * Full-screen reels of one lesson. Swipe (or arrow keys, or the buttons)
 * left/right between reels; past the last reel a "lesson complete" card, and
 * down goes to the next lesson (up on the first reel, to the previous one).
 * A reel counts as done once it is on screen. Resumes at the first open reel.
 */
export const ReelViewer = ({
  modal,
  topic,
}: {
  modal: string;
  topic: Topic;
}) => {
  useModalMounted(modal);
  const {
    reels,
    allTopics,
    catalogs,
    categories,
    notice,
    loadReels,
    setProgress,
  } = useContext();
  const [viewedId, setViewedId] = useState<TopicId>(topic.id);
  const [position, setPosition] = useState<{
    topicId: TopicId;
    index: number;
  } | null>(null);
  const [motion, setMotion] = useState<Motion>('none');
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const gesture = useRef<{
    x: number;
    y: number;
    axis: 'x' | 'y' | null;
    id: number;
  } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const marked = useRef(new Set<string>());

  const viewed = allTopics.find((t) => t.id === viewedId) ?? topic;
  const own = reels[viewedId];
  const { prev, next } = neighbourLessons(
    lessonOrder(allTopics, catalogs, categories, viewedId),
    viewedId,
  );
  // Resume at the first reel not done; decided once per lesson, when its reels arrive.
  if (own && position?.topicId !== viewedId)
    setPosition({ topicId: viewedId, index: resumeIndex(own) });
  const total = own?.length ?? 0;
  const index =
    own && position?.topicId === viewedId
      ? Math.min(position.index, total)
      : null;
  const complete = index !== null && index >= total;
  const reel = own && index !== null ? own[index] : undefined;
  const failed =
    own === undefined &&
    notice?.tone === 'error' &&
    notice.code === 'KNOWLEDGE_REELS_LOAD_FAILED';

  // Reads the lesson (fresh signed links) whenever it changes.
  useEffect(() => {
    loadReels(viewedId);
  }, [loadReels, viewedId]);

  // A reel on screen is a reel seen. One request per reel, never a retry loop.
  useEffect(() => {
    if (!reel || reel.done || marked.current.has(reel.id)) return;
    marked.current.add(reel.id);
    setProgress(reel.id, true);
  }, [reel, setProgress]);

  const goTo = (to: number, how: Motion) => {
    if (index === null || to < 0 || to > total || to === index) return;
    setMotion(how);
    setPosition({ topicId: viewedId, index: to });
  };
  const goReel = (delta: 1 | -1) =>
    goTo(index === null ? 0 : index + delta, delta === 1 ? 'next' : 'prev');
  const goLesson = (
    target: Topic | null,
    how: 'lesson-next' | 'lesson-prev',
  ) => {
    if (!target) return;
    setMotion(how);
    setViewedId(target.id);
  };
  const onLastReel = index !== null && index >= total - 1;
  const onFirstReel = index === 0 || total === 0;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const act = (run: () => void) => {
      event.preventDefault();
      run();
    };
    if (event.key === 'ArrowRight') act(() => goReel(1));
    else if (event.key === 'ArrowLeft') act(() => goReel(-1));
    else if (event.key === 'ArrowDown' && onLastReel && next) {
      if (atEdge(scroller.current, 'bottom'))
        act(() => goLesson(next, 'lesson-next'));
    } else if (event.key === 'ArrowUp' && onFirstReel && prev) {
      if (atEdge(scroller.current, 'top'))
        act(() => goLesson(prev, 'lesson-prev'));
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !event.isPrimary) return;
    if (
      event.target instanceof Element &&
      event.target.closest('a,button,video,pre,table,input,textarea')
    )
      return;
    gesture.current = {
      x: event.clientX,
      y: event.clientY,
      axis: null,
      id: event.pointerId,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    const dx = event.clientX - g.x;
    const dy = event.clientY - g.y;
    if (!g.axis && Math.max(Math.abs(dx), Math.abs(dy)) > AXIS_LOCK)
      g.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
    if (g.axis === 'x') setDrag({ x: dx, y: 0 });
    else if (g.axis === 'y') setDrag({ x: 0, y: dy });
  };
  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    gesture.current = null;
    setDrag(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (event.type === 'pointercancel') return;
    const dx = event.clientX - g.x;
    const dy = event.clientY - g.y;
    if (g.axis === 'x' && Math.abs(dx) >= SWIPE_X) goReel(dx < 0 ? 1 : -1);
    else if (g.axis === 'y' && Math.abs(dy) >= SWIPE_Y) {
      if (dy > 0 && onLastReel) goLesson(next, 'lesson-next');
      else if (dy < 0 && onFirstReel) goLesson(prev, 'lesson-prev');
    }
  };

  const status = complete
    ? 'Lekcja ukończona'
    : index !== null && total > 0
      ? `Rolka ${index + 1} z ${total}`
      : '';

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) closeModal(modal);
      }}
    >
      <Dialog.Portal>
        <Dialog.Content
          data-e2e="knowledge:reel-viewer"
          onKeyDown={onKeyDown}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            if (e.target instanceof HTMLElement) e.target.focus();
          }}
          className="fixed inset-0 z-(--z-modal) flex flex-col bg-surface text-ink focus:outline-none"
        >
          <header className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
            {own && total > 0 ? (
              <Segments reels={own} index={index ?? 0} />
            ) : (
              <Skeleton className="h-1 w-full rounded-full" />
            )}
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <Dialog.Title
                  data-e2e="knowledge:viewer-title"
                  className="truncate text-base font-semibold"
                >
                  {viewed.title}
                </Dialog.Title>
                <Dialog.Description className="text-xs text-ink-soft">
                  <span data-e2e="knowledge:viewer-status">{status}</span>
                </Dialog.Description>
              </div>
              <Dialog.Close
                data-e2e={`knowledge:modal-close:${modal}`}
                aria-label="Zamknij"
                className="grid size-11 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <X className="size-5" aria-hidden="true" />
              </Dialog.Close>
            </div>
          </header>

          <p aria-live="polite" className="sr-only">
            {status}
          </p>

          <section
            aria-roledescription="carousel"
            aria-label={`Rolki: ${viewed.title}`}
            data-e2e="knowledge:viewer-stage"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            className="relative min-h-0 flex-1 touch-pan-y select-none overflow-hidden"
          >
            {failed ? (
              <div
                role="alert"
                data-e2e="knowledge:viewer-error"
                className="mx-auto mt-6 flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-danger-line bg-danger-soft px-4 py-6 text-center"
              >
                <TriangleAlert
                  className="size-6 text-danger"
                  aria-hidden="true"
                />
                <h2 className="text-base font-semibold">
                  Nie udało się wczytać rolek
                </h2>
                <p className="font-mono text-xs text-danger">
                  KNOWLEDGE_REELS_LOAD_FAILED
                </p>
                <p className="text-sm text-ink-soft">
                  {notice?.tone === 'error' ? notice.description : ''}
                </p>
                <div className="flex w-full gap-2">
                  <Button onClick={() => loadReels(viewedId)}>Ponów</Button>
                  <Button variant="ghost" onClick={() => closeModal(modal)}>
                    Wróć
                  </Button>
                </div>
              </div>
            ) : index === null ? (
              <ViewerSkeleton />
            ) : (
              <div
                key={`${viewedId}:${index}`}
                ref={scroller}
                role="group"
                aria-roledescription="slide"
                aria-label={status}
                data-e2e={
                  complete
                    ? 'knowledge:viewer-complete'
                    : `knowledge:viewer-reel:${reel?.id ?? ''}`
                }
                style={
                  drag
                    ? { transform: `translate(${drag.x}px, ${drag.y}px)` }
                    : undefined
                }
                className={cn(
                  'mx-auto flex h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4 motion-reduce:animate-none',
                  !drag && ENTER[motion],
                )}
              >
                {complete ? (
                  <div className="my-auto flex flex-col items-center gap-3 text-center">
                    <CircleCheck
                      className="size-14 text-brand"
                      aria-hidden="true"
                    />
                    <h2 className="text-xl font-semibold">Lekcja ukończona</h2>
                    <p className="text-sm text-ink-soft">
                      {viewed.title}: {own?.filter((r) => r.done).length ?? 0} z{' '}
                      {total} rolek.
                    </p>
                    {next ? (
                      <Button
                        className="w-auto px-5 py-2.5"
                        data-e2e="knowledge:viewer-next-lesson-cta"
                        onClick={() => goLesson(next, 'lesson-next')}
                      >
                        <ChevronDown className="size-4" aria-hidden="true" />
                        Następna lekcja: {next.title}
                      </Button>
                    ) : (
                      <p className="text-sm font-medium">
                        To była ostatnia lekcja.
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      className="w-auto px-4 py-2"
                      onClick={() => goTo(0, 'prev')}
                    >
                      <RotateCcw className="size-4" aria-hidden="true" />
                      Powtórz
                    </Button>
                  </div>
                ) : reel ? (
                  <>
                    {reel.media ? (
                      <ReelMediaView
                        media={reel.media}
                        label={`Ilustracja do rolki ${index + 1}`}
                      />
                    ) : null}
                    <Markdown source={reel.body} />
                  </>
                ) : (
                  <div className="my-auto flex flex-col items-center gap-2 text-center">
                    <Film
                      className="size-10 text-ink-soft"
                      aria-hidden="true"
                    />
                    <h2 className="text-base font-semibold">Brak rolek</h2>
                    <p className="text-sm text-ink-soft">
                      Ta lekcja nie ma jeszcze żadnych rolek.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          <nav
            aria-label="Nawigacja po rolkach"
            className="mx-auto flex w-full max-w-2xl flex-col gap-1 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
          >
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Poprzednia rolka"
                data-e2e="knowledge:viewer-prev"
                disabled={index === null || index === 0}
                onClick={() => goReel(-1)}
                className={NAV_BUTTON}
              >
                <ChevronLeft className="size-6" aria-hidden="true" />
              </button>
              <span
                aria-hidden="true"
                className="text-sm font-medium tabular-nums text-ink-soft"
              >
                {status}
              </span>
              <button
                type="button"
                aria-label="Następna rolka"
                data-e2e="knowledge:viewer-next"
                disabled={index === null || complete}
                onClick={() => goReel(1)}
                className={NAV_BUTTON}
              >
                <ChevronRight className="size-6" aria-hidden="true" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                data-e2e="knowledge:viewer-prev-lesson"
                disabled={!prev || !onFirstReel}
                onClick={() => goLesson(prev, 'lesson-prev')}
                className={LESSON_BUTTON}
              >
                <ChevronUp className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Poprzednia lekcja</span>
              </button>
              <button
                type="button"
                data-e2e="knowledge:viewer-next-lesson"
                disabled={!next || !onLastReel}
                onClick={() => goLesson(next, 'lesson-next')}
                className={LESSON_BUTTON}
              >
                <span className="truncate">Następna lekcja</span>
                <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
