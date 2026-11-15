import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';
import { SKELETON_ROWS } from '../configuration/constraints';

const rows = Array.from({ length: SKELETON_ROWS }, (_, i) => i);

/** Mimics the screen: hero with brain, folders, statistics cards. */
export const KnowledgeSkeleton = () => (
  <div
    data-e2e="knowledge:skeleton"
    aria-hidden="true"
    className="flex flex-col gap-3 md:gap-4 xl:grid xl:grid-cols-12 xl:content-start"
  >
    <div className="hero-card flex flex-col gap-4 rounded-4xl p-5 md:p-7 xl:col-span-6 xl:col-start-1 xl:row-start-1">
      <Skeleton className="h-4 w-40 bg-hero-track" />
      <Skeleton className="h-12 w-28 bg-hero-track" />
      <Skeleton className="mx-auto aspect-4/3 w-full max-w-sm bg-hero-track" />
      <Skeleton className="h-12 w-full bg-hero-track" />
    </div>
    <Card className="flex flex-col gap-3 xl:col-span-6 xl:col-start-7 xl:row-span-3 xl:row-start-1">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-11 w-full" />
      {[0, 1].map((folder) => (
        <div key={folder} className="flex flex-col gap-2 p-2">
          <Skeleton className="h-10 w-full" />
          <ul className="flex flex-col">
            {rows.map((i) => (
              <li key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Card>
    <Card className="xl:col-span-6 xl:col-start-1">
      <Skeleton className="mb-4 h-4 w-28" />
      <Skeleton className="h-40 w-full" />
    </Card>
  </div>
);
