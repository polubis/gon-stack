import { APP_ROUTER } from '@/shared/router';
import { ScreenHeader, Skeleton } from '@/shared/ui';

/** Mirrors the scan step: intro line, camera frame, two buttons. */
export const ScanSkeleton = () => (
  <>
    <div className="md:px-4 lg:px-6 xl:px-12">
      <ScreenHeader
        title="Zrób zdjęcie paragonu"
        backHref={APP_ROUTER.dashboard()}
      />
    </div>
    <div
      className="flex flex-1 flex-col items-center justify-between px-6 pb-10 pt-4 md:px-8 lg:grid lg:grid-cols-2 lg:grid-rows-[1fr_1fr] lg:gap-x-16 lg:px-10 lg:py-8 xl:px-16"
      aria-hidden="true"
    >
      <Skeleton className="h-4 w-2/3 lg:col-start-2 lg:row-start-1 lg:self-end" />
      <Skeleton className="my-8 aspect-[3/4] w-full max-w-xs rounded-3xl lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:my-0 lg:max-w-sm lg:justify-self-end" />
      <div className="flex w-full max-w-xs flex-col gap-3 lg:col-start-2 lg:row-start-2 lg:self-start">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  </>
);
