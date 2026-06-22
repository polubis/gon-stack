import { useState, type ComponentProps } from 'react';

import { Check } from 'lucide-react';

import { createHookContext } from '@repo/react-kit/context';
import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Shared Types
 * ============================================================================= */

type ComboboxContextValue = {
  selectedValue: string;
  search: string;
  setSearch: (s: string) => void;
  select: (value: string) => void;
};

/* =============================================================================
 * Context
 * ============================================================================= */

const [ComboboxProvider, useComboboxContext] = createHookContext(
  'Combobox',
  (value: ComboboxContextValue) => value,
);

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type ComboboxRootProps = ComponentProps<'div'> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSearchChange?: (search: string) => void;
};

export type ComboboxSearchProps = ComponentProps<'input'>;

export type ComboboxListProps = ComponentProps<'ul'>;

export type ComboboxListItemProps = ComponentProps<'li'> & {
  value: string;
  disabled?: boolean;
};

/* =============================================================================
 * Root
 * ============================================================================= */

export const ComboboxRoot = ({
  className,
  children,
  value,
  defaultValue,
  onValueChange,
  onSearchChange,
  ...props
}: ComboboxRootProps) => {
  const [internalValue, setInternalValue] = useState(() => defaultValue ?? '');
  const [search, setSearchState] = useState('');

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  const setSearch = (s: string) => {
    setSearchState(s);
    onSearchChange?.(s);
  };

  const select = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  return (
    <ComboboxProvider value={{ selectedValue, search, setSearch, select }}>
      <div
        className={cn(
          'flex flex-col',
          'rounded-xl overflow-hidden',
          'border border-(--combobox-border)',
          'bg-(--combobox-bg)',
          'text-(--combobox-text)',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ComboboxProvider>
  );
};

/* =============================================================================
 * Search
 * ============================================================================= */

export const ComboboxSearch = ({
  className,
  placeholder = 'Search…',
  ...props
}: ComboboxSearchProps) => {
  const { search, setSearch } = useComboboxContext();

  return (
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full px-3 py-2',
        'border-b border-(--combobox-search-border)',
        'bg-transparent',
        'text-sm text-(--combobox-text)',
        'placeholder:text-(--combobox-search-placeholder)',
        'outline-none',
        'transition-all duration-160 ease-in-out',
        'focus-visible:border-(--combobox-search-focus-border)',
        'focus-visible:[box-shadow:0_0_0_2px_var(--combobox-search-focus-ring),0_0_14px_var(--combobox-search-focus-glow)]',
        className,
      )}
      {...props}
    />
  );
};

/* =============================================================================
 * List
 * ============================================================================= */

export const ComboboxList = ({
  className,
  children,
  ...props
}: ComboboxListProps) => {
  return (
    <ul
      role="listbox"
      className={cn(
        'flex flex-col py-1',
        'max-h-60 overflow-y-auto',
        className,
      )}
      {...props}
    >
      {children}
    </ul>
  );
};

/* =============================================================================
 * ListItem
 * ============================================================================= */

export const ComboboxListItem = ({
  className,
  children,
  value,
  disabled = false,
  ...props
}: ComboboxListItemProps) => {
  const { selectedValue, select } = useComboboxContext();
  const isSelected = selectedValue === value;

  return (
    <li
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      className={cn('list-none', className)}
      {...props}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => select(value)}
        className={cn(
          'flex w-full items-center gap-2 px-3 py-2',
          'text-sm text-left',
          'transition-all duration-160 ease-in-out',
          'outline-none',
          isSelected
            ? 'bg-(--combobox-item-selected-bg) text-(--combobox-item-selected-text)'
            : 'text-(--combobox-item-text)',
          'enabled:hover:bg-(--combobox-item-hover)',
          'focus-visible:bg-(--combobox-item-hover)',
          'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--combobox-search-focus-border)',
          'disabled:cursor-not-allowed disabled:text-(--combobox-item-disabled-text)',
        )}
      >
        <span
          className={cn(
            'flex size-4 shrink-0 items-center justify-center',
            'transition-all duration-160 ease-in-out',
            isSelected ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden="true"
        >
          <Check className="size-3" />
        </span>
        {children}
      </button>
    </li>
  );
};

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Combobox = {
  Root: ComboboxRoot,
  Search: ComboboxSearch,
  List: ComboboxList,
  ListItem: ComboboxListItem,
};
