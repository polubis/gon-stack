import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type InputProps = ComponentProps<'input'>;

/* =============================================================================
 * Input
 * ============================================================================= */

export const Input = ({ className, ref, ...props }: InputProps) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full px-3 py-2.5',
        'rounded-(--input-radius)',
        'border border-(--input-border) bg-(--input-bg)',
        'text-sm text-(--input-text)',
        'placeholder:text-(--input-placeholder)',
        'transition-all duration-160 ease-in-out',
        'outline-none',
        'focus-visible:border-(--input-focus-border) focus-visible:shadow-(--input-focus-shadow)',
        'disabled:cursor-not-allowed',
        'disabled:border-(--input-disabled-border) disabled:bg-(--input-disabled-bg) disabled:text-(--input-disabled-text)',
        'disabled:placeholder:text-(--input-disabled-placeholder)',
        className,
      )}
      {...props}
    />
  );
};
