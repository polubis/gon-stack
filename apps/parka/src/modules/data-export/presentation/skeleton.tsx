import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';
import { FORMATS } from '../configuration/constraints';

/** Mirrors the format cards and the export button. */
export const ExportSkeleton = () => (
  <div
    data-e2e="data-export:skeleton"
    role="status"
    aria-busy="true"
    aria-label="Wczytywanie danych do eksportu"
    className="flex flex-col gap-4 md:gap-6"
  >
    <div className="grid gap-2 md:max-w-2xl md:grid-cols-2 md:gap-4">
      {FORMATS.map((f) => (
        <Card key={f} className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-10" />
        </Card>
      ))}
    </div>
    <Skeleton className="h-11 w-full md:max-w-xs" />
  </div>
);
