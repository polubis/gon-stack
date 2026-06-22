import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type DateInputProps = ComponentProps<'input'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const DateInput = ({
  variant: _variant,
  className,
  ...props
}: DateInputProps) => {
  return (
    <input
      type="date"
      className={cn(
        'w-full px-3 py-2.5',
        'rounded-(--input-radius)',
        'border border-(--input-border) bg-(--input-bg)',
        'text-sm text-(--input-text)',
        'transition-all duration-160 ease-in-out',
        'outline-none',
        'focus:border-(--input-focus-border) focus:shadow-(--input-focus-shadow)',
        'disabled:cursor-not-allowed',
        'disabled:border-(--input-disabled-border) disabled:bg-(--input-disabled-bg) disabled:text-(--input-disabled-text)',
        className,
      )}
      {...props}
    />
  );
};
