import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type TableRootProps = ComponentProps<'table'>;
export type TableTHeadProps = ComponentProps<'thead'>;
export type TableTBodyProps = ComponentProps<'tbody'>;
export type TableTFootProps = ComponentProps<'tfoot'>;
export type TableTrProps = ComponentProps<'tr'>;
export type TableThProps = ComponentProps<'th'>;
export type TableTdProps = ComponentProps<'td'>;

/* =============================================================================
 * Root
 * ============================================================================= */

export const TableRoot = ({ className, ...props }: TableRootProps) => {
  return (
    <table
      className={cn('w-full border-collapse text-sm', className)}
      {...props}
    />
  );
};

/* =============================================================================
 * THead
 * ============================================================================= */

export const TableTHead = ({ className, ...props }: TableTHeadProps) => {
  return <thead className={cn('bg-(--table-head-bg)', className)} {...props} />;
};

/* =============================================================================
 * TBody
 * ============================================================================= */

export const TableTBody = ({ className, ...props }: TableTBodyProps) => {
  return (
    <tbody
      className={cn(
        'divide-y divide-(--table-border)',
        '[&>tr:hover]:bg-(--table-row-hover)',
        className,
      )}
      {...props}
    />
  );
};

/* =============================================================================
 * TFoot
 * ============================================================================= */

export const TableTFoot = ({ className, ...props }: TableTFootProps) => {
  return <tfoot className={cn('bg-(--table-foot-bg)', className)} {...props} />;
};

/* =============================================================================
 * Tr
 * ============================================================================= */

export const TableTr = ({ className, ...props }: TableTrProps) => {
  return (
    <tr
      className={cn(
        'border-b border-(--table-border)',
        'transition-colors duration-100',
        className,
      )}
      {...props}
    />
  );
};

/* =============================================================================
 * Th
 * ============================================================================= */

export const TableTh = ({ className, ...props }: TableThProps) => {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left',
        'font-sans text-xs font-semibold uppercase tracking-[0.14em] text-(--table-head-text)',
        'border-b border-(--table-border)',
        className,
      )}
      {...props}
    />
  );
};

/* =============================================================================
 * Td
 * ============================================================================= */

export const TableTd = ({ className, ...props }: TableTdProps) => {
  return (
    <td
      className={cn('px-4 py-3', 'text-sm text-(--table-cell-text)', className)}
      {...props}
    />
  );
};

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Table = {
  Root: TableRoot,
  Thead: TableTHead,
  Tbody: TableTBody,
  Tfoot: TableTFoot,
  Tr: TableTr,
  Th: TableTh,
  Td: TableTd,
};
