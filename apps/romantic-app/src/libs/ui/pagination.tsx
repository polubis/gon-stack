import { useState, type ComponentProps } from 'react';
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { createHookContext } from '@repo/react-kit/context';
import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Shared Types
 * ============================================================================= */

type PaginationContextValue = {
  page: number;
  totalPages: number;
  goTo: (page: number) => void;
};

/* =============================================================================
 * Context
 * ============================================================================= */

const [PaginationProvider, usePaginationContext] = createHookContext(
  'Pagination',
  (value: PaginationContextValue) => value,
);

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type PaginationRootProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  page?: number;
  defaultPage?: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
};

export type PaginationFirstProps = ComponentProps<'button'>;
export type PaginationPrevProps = ComponentProps<'button'>;
export type PaginationPageProps = ComponentProps<'span'>;
export type PaginationNextProps = ComponentProps<'button'>;
export type PaginationLastProps = ComponentProps<'button'>;

/* =============================================================================
 * Root
 * ============================================================================= */

export const PaginationRoot = ({
  page,
  defaultPage,
  totalPages,
  onPageChange,
  className,
  children,
  ...props
}: PaginationRootProps) => {
  const [internalPage, setInternalPage] = useState(() => {
    if (page !== undefined) return page;
    if (defaultPage !== undefined) return defaultPage;
    return 1;
  });

  const isControlled = page !== undefined;
  const currentPage = isControlled ? page : internalPage;

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), totalPages);
    if (!isControlled) {
      setInternalPage(clamped);
    }
    onPageChange?.(clamped);
  };

  return (
    <PaginationProvider value={{ page: currentPage, totalPages, goTo }}>
      <div
        className={cn('inline-flex items-center gap-2', className)}
        {...props}
      >
        {children}
      </div>
    </PaginationProvider>
  );
};

/* =============================================================================
 * First
 * ============================================================================= */

export const PaginationFirst = ({
  className,
  ...props
}: PaginationFirstProps) => {
  const ctx = usePaginationContext();
  const isDisabled = ctx.page <= 1;

  return (
    <button
      type="button"
      onClick={() => ctx.goTo(1)}
      disabled={isDisabled}
      aria-label="Go to first page"
      className={cn(
        'inline-flex items-center justify-center',
        'size-10 rounded-(--btn-radius)',
        'transition-all duration-160 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pagination-btn-focus) focus-visible:ring-offset-0',
        'disabled:cursor-not-allowed',
        'border border-(--pagination-btn-border) bg-(--pagination-btn-bg) text-(--pagination-btn-text)',
        'enabled:hover:bg-(--pagination-btn-bg-hover)',
        'disabled:border-(--pagination-btn-disabled-border) disabled:bg-(--pagination-btn-disabled-bg) disabled:text-(--pagination-btn-disabled-text)',
        className,
      )}
      {...props}
    >
      <ChevronFirst className="size-4" aria-hidden="true" />
    </button>
  );
};

/* =============================================================================
 * Prev
 * ============================================================================= */

export const PaginationPrev = ({
  className,
  ...props
}: PaginationPrevProps) => {
  const ctx = usePaginationContext();
  const isDisabled = ctx.page <= 1;

  return (
    <button
      type="button"
      onClick={() => ctx.goTo(ctx.page - 1)}
      disabled={isDisabled}
      aria-label="Go to previous page"
      className={cn(
        'inline-flex items-center justify-center',
        'size-10 rounded-(--btn-radius)',
        'transition-all duration-160 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pagination-btn-focus) focus-visible:ring-offset-0',
        'disabled:cursor-not-allowed',
        'border border-(--pagination-btn-border) bg-(--pagination-btn-bg) text-(--pagination-btn-text)',
        'enabled:hover:bg-(--pagination-btn-bg-hover)',
        'disabled:border-(--pagination-btn-disabled-border) disabled:bg-(--pagination-btn-disabled-bg) disabled:text-(--pagination-btn-disabled-text)',
        className,
      )}
      {...props}
    >
      <ChevronLeft className="size-4" aria-hidden="true" />
    </button>
  );
};

/* =============================================================================
 * Page
 * ============================================================================= */

export const PaginationPage = ({
  className,
  ...props
}: PaginationPageProps) => {
  const ctx = usePaginationContext();

  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'min-w-16 px-3 py-2 text-center text-sm font-semibold',
        'text-(--pagination-page-text)',
        className,
      )}
      {...props}
    >
      {ctx.page} / {ctx.totalPages}
    </span>
  );
};

/* =============================================================================
 * Next
 * ============================================================================= */

export const PaginationNext = ({
  className,
  ...props
}: PaginationNextProps) => {
  const ctx = usePaginationContext();
  const isDisabled = ctx.page >= ctx.totalPages;

  return (
    <button
      type="button"
      onClick={() => ctx.goTo(ctx.page + 1)}
      disabled={isDisabled}
      aria-label="Go to next page"
      className={cn(
        'inline-flex items-center justify-center',
        'size-10 rounded-(--btn-radius)',
        'transition-all duration-160 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pagination-btn-focus) focus-visible:ring-offset-0',
        'disabled:cursor-not-allowed',
        'border border-(--pagination-btn-border) bg-(--pagination-btn-bg) text-(--pagination-btn-text)',
        'enabled:hover:bg-(--pagination-btn-bg-hover)',
        'disabled:border-(--pagination-btn-disabled-border) disabled:bg-(--pagination-btn-disabled-bg) disabled:text-(--pagination-btn-disabled-text)',
        className,
      )}
      {...props}
    >
      <ChevronRight className="size-4" aria-hidden="true" />
    </button>
  );
};

/* =============================================================================
 * Last
 * ============================================================================= */

export const PaginationLast = ({
  className,
  ...props
}: PaginationLastProps) => {
  const ctx = usePaginationContext();
  const isDisabled = ctx.page >= ctx.totalPages;

  return (
    <button
      type="button"
      onClick={() => ctx.goTo(ctx.totalPages)}
      disabled={isDisabled}
      aria-label="Go to last page"
      className={cn(
        'inline-flex items-center justify-center',
        'size-10 rounded-(--btn-radius)',
        'transition-all duration-160 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pagination-btn-focus) focus-visible:ring-offset-0',
        'disabled:cursor-not-allowed',
        'border border-(--pagination-btn-border) bg-(--pagination-btn-bg) text-(--pagination-btn-text)',
        'enabled:hover:bg-(--pagination-btn-bg-hover)',
        'disabled:border-(--pagination-btn-disabled-border) disabled:bg-(--pagination-btn-disabled-bg) disabled:text-(--pagination-btn-disabled-text)',
        className,
      )}
      {...props}
    >
      <ChevronLast className="size-4" aria-hidden="true" />
    </button>
  );
};

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Pagination = {
  Root: PaginationRoot,
  First: PaginationFirst,
  Prev: PaginationPrev,
  Page: PaginationPage,
  Next: PaginationNext,
  Last: PaginationLast,
};
