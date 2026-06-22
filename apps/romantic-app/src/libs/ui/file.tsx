import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type FileProps = ComponentProps<'div'> & {
  variant?: 'primary' | 'secondary';
  name?: string;
  meta?: string;
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const File = ({
  variant: _variant,
  name,
  meta,
  className,
  children,
  ...props
}: FileProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        'px-3 py-2.5',
        'rounded-lg',
        'border border-(--file-border) bg-(--file-bg)',
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="shrink-0 text-(--file-meta-text)">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </span>
      {(name ?? children) ? (
        <div className="flex min-w-0 flex-1 flex-col">
          {name && (
            <span className="truncate text-sm text-(--file-text)">{name}</span>
          )}
          {meta && (
            <span className="text-xs text-(--file-meta-text)">{meta}</span>
          )}
          {children}
        </div>
      ) : null}
    </div>
  );
};
