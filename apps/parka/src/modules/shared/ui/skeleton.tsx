import { cn } from '@repo/react-kit/cn';

/** Placeholder block; size it like the content it stands in for. */
export const Skeleton = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      'block animate-pulse rounded-lg bg-track motion-reduce:animate-none',
      className,
    )}
  />
);
