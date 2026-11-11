import { Leaf } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';

/** Brand tile: obsidian square, lime leaf. Decorative; name it next to it. */
export const BrandMark = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      'hero-card grid size-10 shrink-0 place-items-center rounded-2xl',
      className,
    )}
  >
    <Leaf className="size-1/2 text-accent" />
  </span>
);
