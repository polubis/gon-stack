import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { createHookContext } from '../power-context';
import { cn } from './cn';

/* =============================================================================
 * Shared Types
 * ============================================================================= */

type DropdownContextValue = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

/* =============================================================================
 * Context
 * ============================================================================= */

const [DropdownProvider, useDropdownContext] = createHookContext(
  'Dropdown',
  (value: DropdownContextValue) => value,
);

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type DropdownRootProps = {
  children: ReactNode;
  className?: string;
};

export type DropdownTriggerProps = ComponentProps<'div'>;

export type DropdownContentProps = ComponentProps<'div'> & {
  align?: 'left' | 'right';
};

export type DropdownItemProps = ComponentProps<'button'> & {
  label: string;
  onSelect?: () => void;
};

/* =============================================================================
 * Root
 * ============================================================================= */

export const DropdownRoot = ({ children, className }: DropdownRootProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <DropdownProvider
      value={{
        open,
        toggle: () => setOpen((prev) => !prev),
        close: () => setOpen(false),
      }}
    >
      <div ref={ref} className={cn('relative inline-block', className)}>
        {children}
      </div>
    </DropdownProvider>
  );
};

/* =============================================================================
 * Trigger
 * ============================================================================= */

export const DropdownTrigger = ({
  className,
  children,
  ...props
}: DropdownTriggerProps) => {
  const { toggle } = useDropdownContext();

  return (
    <div onClick={toggle} className={cn(className)} {...props}>
      {children}
    </div>
  );
};

/* =============================================================================
 * Content
 * ============================================================================= */

export const DropdownContent = ({
  align = 'right',
  className,
  children,
  ...props
}: DropdownContentProps) => {
  const { open } = useDropdownContext();

  if (!open) return null;

  return (
    <div
      role="menu"
      className={cn(
        'absolute top-full mt-2 z-50',
        'min-w-40 py-1',
        'bg-card-bg border border-card-border-c rounded-md',
        'shadow-[0_4px_24px_rgba(0,0,0,0.08)]',
        align === 'right' ? 'right-0' : 'left-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/* =============================================================================
 * Item
 * ============================================================================= */

export const DropdownItem = ({
  label,
  onSelect,
  className,
  ...props
}: DropdownItemProps) => {
  const { close } = useDropdownContext();

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        onSelect?.();
        close();
      }}
      className={cn(
        'w-full text-left px-4 py-2',
        'font-sans text-sm text-ink',
        'hover:bg-soft-stone transition-colors duration-150',
        className,
      )}
      {...props}
    >
      {label}
    </button>
  );
};

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Dropdown = {
  Root: DropdownRoot,
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  Item: DropdownItem,
};
