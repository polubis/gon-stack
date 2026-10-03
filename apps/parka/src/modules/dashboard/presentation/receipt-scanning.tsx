import { Skeleton } from '@/shared/ui/skeleton';

/** Stands in for the expense form while the photo is being read. */
export const ReceiptScanning = () => (
  <div
    role="status"
    data-e2e="dashboard:receipt-scanning"
    className="space-y-3"
  >
    <span className="sr-only">Analizuję paragon…</span>
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-16 w-full" />
  </div>
);
