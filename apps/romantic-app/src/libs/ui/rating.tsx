import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type RatingRootProps = ComponentProps<'div'>;

export type RatingItemProps = Omit<ComponentProps<'span'>, 'children'> & {
  filled?: boolean;
};

/* =============================================================================
 * Root
 * ============================================================================= */

export const RatingRoot = ({ className, ...props }: RatingRootProps) => {
  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  );
};

/* =============================================================================
 * Item
 * ============================================================================= */

export const RatingItem = ({
  filled = false,
  className,
  ...props
}: RatingItemProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center text-xl leading-none select-none',
        'transition-all duration-160 ease-in-out',
        filled && [
          'text-transparent bg-linear-to-br from-(--rating-star-filled-from) to-(--rating-star-filled-to) bg-clip-text',
          'drop-shadow-[0_0_6px_var(--rating-star-glow)]',
        ],
        !filled && 'text-(--rating-star-empty)',
        className,
      )}
      {...props}
    >
      ★
    </span>
  );
};

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Rating = {
  Root: RatingRoot,
  Item: RatingItem,
};
