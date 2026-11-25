import { cn } from '@repo/react-kit/cn';
import type { CSSProperties } from 'react';

type Props = {
  /** Slot of the active item, `null` hides the pill in place. */
  index: number | null;
  axis: 'x' | 'y';
  className?: string;
};

/**
 * Moving pill under the active nav item. Items never change size: only this
 * pill slides (transform, GPU only). Off under reduced motion.
 */
export const NavIndicator = ({ index, axis, className }: Props) => (
  <span
    aria-hidden="true"
    data-e2e="app-nav:indicator"
    style={{ '--nav-index': index ?? 0 } as CSSProperties}
    className={cn(
      'cta shadow-cta pointer-events-none absolute left-0 top-0 rounded-full transition-[translate,opacity] duration-300 ease-enter will-change-transform motion-reduce:transition-none',
      axis === 'x'
        ? 'translate-x-[calc(var(--nav-index)*(100%+var(--spacing)))]'
        : 'translate-y-[calc(var(--nav-index)*(100%+var(--spacing)))]',
      index === null && 'opacity-0',
      className,
    )}
  />
);
