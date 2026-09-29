import { APP_ROUTER } from '@/shared/router';
import { ScreenHeader, Skeleton } from '@/shared/ui';

/** Mirrors the scan step: intro line, camera frame, two buttons. */
export const ScanSkeleton = () => (
  <>
    <ScreenHeader
      title="Zrób zdjęcie paragonu"
      backHref={APP_ROUTER.dashboard()}
    />
    <div
      className="flex flex-1 flex-col items-center justify-between px-6 pb-10 pt-4"
      aria-hidden="true"
    >
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="my-8 aspect-[3/4] w-full max-w-xs rounded-3xl" />
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  </>
);
