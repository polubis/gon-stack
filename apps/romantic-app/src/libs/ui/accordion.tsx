import { useState, type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type AccordionProps = ComponentProps<'div'> & {
  variant?: 'primary' | 'secondary';
  defaultOpen?: boolean;
};

export type AccordionTriggerProps = ComponentProps<'button'>;
export type AccordionContentProps = ComponentProps<'div'>;

/* =============================================================================
 * Root
 * ============================================================================= */

export const AccordionRoot = ({
  variant: _variant,
  defaultOpen = false,
  className,
  children,
  ...props
}: AccordionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      data-open={open}
      className={cn(
        'w-full rounded-xl overflow-hidden',
        'border border-(--accordion-border) bg-(--accordion-bg)',
        className,
      )}
      {...props}
    >
      {typeof children === 'function'
        ? (children as (open: boolean, toggle: () => void) => React.ReactNode)(
            open,
            () => setOpen(!open),
          )
        : children}
    </div>
  );
};

/* =============================================================================
 * Trigger
 * ============================================================================= */

export const AccordionTrigger = ({
  className,
  children,
  ...props
}: AccordionTriggerProps) => {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center justify-between',
        'px-4 py-3',
        'text-sm font-medium text-(--accordion-trigger-text)',
        'transition-all duration-160 ease-in-out',
        'outline-none',
        'hover:bg-(--accordion-trigger-bg-hover)',
        'focus-visible:ring-2 focus-visible:ring-(--accordion-trigger-focus)',
        className,
      )}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        className="ml-2 shrink-0 text-xs transition-transform duration-200 [[data-open=true]_&]:rotate-180"
      >
        ▾
      </span>
    </button>
  );
};

/* =============================================================================
 * Content
 * ============================================================================= */

export const AccordionContent = ({
  className,
  ...props
}: AccordionContentProps) => {
  return (
    <div
      className={cn(
        'px-4 pb-4',
        'text-sm text-(--accordion-content-text)',
        'border-t border-(--accordion-border)',
        className,
      )}
      {...props}
    />
  );
};

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Accordion = {
  Root: AccordionRoot,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
};
