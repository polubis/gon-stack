import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type BreadcrumbsProps = ComponentProps<'nav'> & {
  variant?: 'primary' | 'secondary';
};

export type BreadcrumbsListProps = ComponentProps<'ol'>;

export type BreadcrumbsItemProps = ComponentProps<'li'>;

export type BreadcrumbsLinkProps = ComponentProps<'a'> & {
  active?: boolean;
};

export type BreadcrumbsSeparatorProps = ComponentProps<'span'>;

/* =============================================================================
 * Root
 * ============================================================================= */

export const BreadcrumbsRoot = ({
  variant: _variant,
  className,
  ...props
}: BreadcrumbsProps) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center', className)}
      {...props}
    />
  );
};

/* =============================================================================
 * List
 * ============================================================================= */

export const BreadcrumbsList = ({
  className,
  ...props
}: BreadcrumbsListProps) => {
  return (
    <ol
      className={cn('flex flex-wrap items-center gap-1.5', className)}
      {...props}
    />
  );
};

/* =============================================================================
 * Item
 * ============================================================================= */

export const BreadcrumbsItem = ({
  className,
  ...props
}: BreadcrumbsItemProps) => {
  return (
    <li
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  );
};

/* =============================================================================
 * Link
 * ============================================================================= */

export const BreadcrumbsLink = ({
  active,
  className,
  ...props
}: BreadcrumbsLinkProps) => {
  return (
    <a
      aria-current={active ? 'page' : undefined}
      className={cn(
        'text-sm transition-colors duration-160',
        'outline-none focus-visible:ring-2 focus-visible:ring-(--breadcrumb-focus) focus-visible:rounded-sm',
        active
          ? 'font-medium text-(--breadcrumb-text-active) pointer-events-none'
          : 'text-(--breadcrumb-text) hover:text-(--breadcrumb-text-hover)',
        className,
      )}
      {...props}
    />
  );
};

/* =============================================================================
 * Separator
 * ============================================================================= */

export const BreadcrumbsSeparator = ({
  className,
  children,
  ...props
}: BreadcrumbsSeparatorProps) => {
  return (
    <span
      aria-hidden="true"
      className={cn('text-xs text-(--breadcrumb-separator)', className)}
      {...props}
    >
      {children ?? '/'}
    </span>
  );
};

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Breadcrumbs = {
  Root: BreadcrumbsRoot,
  List: BreadcrumbsList,
  Item: BreadcrumbsItem,
  Link: BreadcrumbsLink,
  Separator: BreadcrumbsSeparator,
};
