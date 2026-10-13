import { useEffect, useEffectEvent, useRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import { ErrorState } from '@/shared/ui/error-state';
import { ERROR_CODES, LOAD_AHEAD_MARGIN } from '../configuration/constraints';
import { useContext } from './context';
import { ListSkeleton } from './list-skeleton';

const NEXT_PAGE_SKELETONS = 2;

/**
 * End of the list: asks for the next page when it scrolls near, with a
 * keyboard-reachable button as the fallback, card-shaped placeholders while
 * loading, a retry when the page failed and a closing line at the very end.
 */
export const LoadMore = () => {
  const ctx = useContext();
  const hasMore = ctx.useHasMore();
  const loading = ctx.useLoadingMore();
  const error = ctx.useMoreError();
  const sentinel = useRef<HTMLDivElement>(null);
  const requestMore = useEffectEvent(() => ctx.loadMore());
  const watching = hasMore && !loading && !error;

  useEffect(() => {
    const node = sentinel.current;
    if (!watching || !node || typeof IntersectionObserver === 'undefined')
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) requestMore();
      },
      { rootMargin: LOAD_AHEAD_MARGIN },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [watching]);

  if (error) {
    return (
      <ErrorState
        data-e2e="notifications:more-error"
        title="Nie udało się wczytać kolejnych powiadomień"
        code={ERROR_CODES.loadMore}
        description={error}
        onRetry={ctx.loadMore}
        backHref={APP_ROUTER.settings()}
      />
    );
  }

  if (!hasMore) {
    return (
      <p
        data-e2e="notifications:end"
        className="py-2 text-center text-xs text-ink-soft"
      >
        To wszystkie powiadomienia.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      {loading ? (
        <>
          <span role="status" className="sr-only">
            Wczytuję kolejne powiadomienia
          </span>
          <ListSkeleton
            count={NEXT_PAGE_SKELETONS}
            data-e2e="notifications:loading-more"
          />
          <LoaderCircle
            className="mx-auto h-5 w-5 animate-spin text-ink-soft motion-reduce:animate-none"
            aria-hidden="true"
          />
        </>
      ) : (
        <div ref={sentinel} data-e2e="notifications:sentinel">
          <Button
            variant="ghost"
            data-e2e="notifications:load-more"
            onClick={ctx.loadMore}
            className="mx-auto w-auto"
          >
            Wczytaj więcej
          </Button>
        </div>
      )}
    </div>
  );
};
