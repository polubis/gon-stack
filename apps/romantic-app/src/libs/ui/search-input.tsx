import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type SearchInputProps = ComponentProps<'input'> & {
  variant?: 'primary' | 'secondary';
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const SearchInput = ({
  variant: _variant,
  className,
  ...props
}: SearchInputProps) => {
  return (
    <div className="relative w-full">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--input-placeholder)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        type="search"
        className={cn(
          'w-full pl-9 pr-3 py-2.5',
          'rounded-(--input-radius)',
          'border border-(--input-border) bg-(--input-bg)',
          'text-sm text-(--input-text)',
          'placeholder:text-(--input-placeholder)',
          'transition-all duration-160 ease-in-out',
          'outline-none',
          'focus:border-(--input-focus-border) focus:shadow-(--input-focus-shadow)',
          'disabled:cursor-not-allowed',
          'disabled:border-(--input-disabled-border) disabled:bg-(--input-disabled-bg) disabled:text-(--input-disabled-text)',
          className,
        )}
        {...props}
      />
    </div>
  );
};
